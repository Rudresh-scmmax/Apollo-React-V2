import { useQuery } from "@tanstack/react-query";
import React, { useState, useMemo, useEffect } from "react";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { convertApiToMaterialFormat } from "./CostsheetUtility";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

type APISubstitute = {
  name: string;
  chemical: string;
  moles: number;
  molecular_weight: number;
  prices: { [month: string]: number };
};

type APIMaterial = {
  mainMaterial: string;
  chemical: string;
  moles: number;
  molecular_weight: number;
  prices: { [month: string]: number };
  substitutes: APISubstitute[];
};

const MaterialSheet = () => {
  const { getMaterialSubtituteData } = useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );

  const { data: materialSubtituteData, isLoading } = useQuery({
    queryKey: ["materialSubtituteData", selectedMaterial?.material_code],
    queryFn: () =>
      getMaterialSubtituteData(selectedMaterial?.material_code || ""),
    enabled: !!selectedMaterial,
  });

  // Always call hooks at the top level
  const { apiData, months, mainMaterialPriceHistory } = useMemo(() => {
    if (!materialSubtituteData)
      return { apiData: [], months: [], mainMaterialPriceHistory: [] };
    return convertApiToMaterialFormat(materialSubtituteData);
  }, [materialSubtituteData]);

  console.log("Converted API Data:", apiData);
  console.log("Months:", months);

  const substituteMaterials = useMemo(() => {
    const all: {
      material: string;
      chemical: string;
      moles: number;
      molecular_weight: number;
      prices: { [month: string]: number };
    }[] = [];
    apiData.forEach((mat) => {
      mat.substitutes.forEach((sub) => {
        all.push({
          material: sub.name,
          chemical: sub.chemical,
          moles: sub.moles,
          molecular_weight: sub.molecular_weight,
          prices: sub.prices,
        });
      });
    });
    return all;
  }, [apiData]);

  console.log("Substitute Materials:", substituteMaterials);

  const getMainMaterialPrice = (month: string) => {
    // Find the latest po_date for this month
    const filtered = mainMaterialPriceHistory.filter(
      (row) => row.month === month
    );
    if (!filtered.length) return "-";
    // If multiple, pick the latest po_date
    const latest = filtered.reduce((a, b) =>
      new Date(a.po_date) > new Date(b.po_date) ? a : b
    );
    return latest.price;
  };
  const [inputRM, setInputRM] = useState<
    Record<string, { moles: number; molecular_weight: number }>
  >({});

  useEffect(() => {
    if (substituteMaterials.length > 0) {
      setInputRM(
        substituteMaterials.reduce((acc, mat) => {
          acc[mat.material] = {
            moles: mat.moles,
            molecular_weight: mat.molecular_weight,
          };
          return acc;
        }, {} as Record<string, { moles: number; molecular_weight: number }>)
      );
    }
  }, [substituteMaterials]);

  

  const handleInputRMChange = (
    material: string,
    field: "moles" | "molecular_weight",
    value: string
  ) => {
    setInputRM((prev) => ({
      ...prev,
      [material]: {
        ...prev[material],
        [field]: Number(value),
      },
    }));
  };

  const getActualQuantity = (material: string) => {
    const { moles, molecular_weight } = inputRM[material];
    return moles * molecular_weight;
  };

  const getTonPerTon = (material: string) => {
    const { moles, molecular_weight } = inputRM[material];
    return (moles * molecular_weight) / 100;
  };

  const getRMPrice = (material: string, month: string): number | string => {
    const mat = substituteMaterials.find((m) => m.material === material);
    return mat && mat.prices[month] !== undefined ? mat.prices[month] : "-";
  };

  const getConsumptionPerKg = (material: string, month: string) => {
    const ton = inputRM[material] && getTonPerTon(material);
    const rm = getRMPrice(material, month);
    return typeof rm === "number" ? ton * rm : 0;
  };

  const getTotalRMC = (month: string): string => {
    // Sum of all consumption per kg for this month
    const total = substituteMaterials
      .map((mat) => getConsumptionPerKg(mat.material, month))
      .reduce((a, b) => a + b, 0);
    return total.toFixed(2);
  };

  const purchasedPrices: { [month: string]: number } = {
    "Jan 2024": 396.8323955,
    "Feb 2024": 793.3120517,
    "Aug 2024": 1102.31221,
    "Sep 2024": 1047.382768,
    "Jan 2025": 1278.966316,
    "Mar 2025": 1057.043922,
    "Apr 2025": 1197.11106,
    "May 2025": 1171.566812,
    "Jun 2025": 905,
  };

  // const getPurchasePrice = (month: string): string => {
  //   const totalTonPerTon = substituteMaterials
  //     .map((mat) => (inputRM[mat.material] ? getTonPerTon(mat.material) : 0))
  //     .reduce((a, b) => a + b, 0);
  //   const purchasePrice = purchasedPrices[month] ?? 0;
  //   return (totalTonPerTon * purchasePrice).toFixed(2);
  // };

  const getPurchasePrice = (month: string): string => {
    const maintMaterialPrice = getMainMaterialPrice(month);

    // Total RMC material price for the month
    const totalRMC = parseFloat(getTotalRMC(month));

    // If either is missing, show "-"
    if (
      isNaN(maintMaterialPrice) ||
      isNaN(totalRMC) ||
      maintMaterialPrice === 0 ||
      totalRMC === 0
    ) {
      return "-";
    }

    // Return the difference
    return (maintMaterialPrice - totalRMC).toFixed(2);
  };

  const getDelta = (month: string): string => {
    return (
      parseFloat(getTotalRMC(month)) - parseFloat(getPurchasePrice(month))
    ).toFixed(2);
  };

  // Calculate the minimum purchase price across all months
  const minPurchasePrice = useMemo(() => {
    const prices = months
      .map((month) => parseFloat(getPurchasePrice(month)))
      .filter((val) => !isNaN(val) && val !== 0);
    if (prices.length === 0) return "-";
    return Math.min(...prices).toFixed(2);
  }, [months, getPurchasePrice]);

  const getShouldBePrice = (month: string): string => {
    const totalRMC = parseFloat(getTotalRMC(month));
    const minDelta = parseFloat(minPurchasePrice);
    if (isNaN(totalRMC) || isNaN(minDelta)) return "-";
    return (totalRMC + minDelta).toFixed(2);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Material Sheet for: {selectedMaterial?.material_description}
      </h1>
      <div className="table-wrapper overflow-auto">
        <table className="styled-table border border-gray-300 min-w-max text-xm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-2">Type</th>
              <th className="border px-2 py-2">Material</th>
              <th className="border px-2 py-2">Chemical Name</th>
              <th className="border px-2 py-2">moles</th>
              <th className="border px-2 py-2">molecular weight</th>
              <th className="border px-2 py-2">actual quantities</th>
              <th className="border px-2 py-2">ton/ton</th>
              {months.map((month) => (
                <th key={month} className="border px-2 py-2 text-center">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Main Material Purchase Price */}
            <tr>
              <td className="border px-2 py-2 font-bold bg-green-100">
                Main Material
              </td>
              <td className="border px-2 py-2 font-bold bg-green-100">
                {apiData[0]?.mainMaterial ?? "-"}
              </td>
              <td className="border px-2 py-2 bg-green-100" colSpan={5}>
                Purchase Price
              </td>
              {months.map((month) => (
                <td
                  key={month}
                  className="border px-2 py-2 text-center font-bold bg-green-100"
                >
                  {getMainMaterialPrice(month) ?? "-"}
                </td>
              ))}
            </tr>
            {/* Raw Material Price Rows */}
            {apiData[0]?.substitutes?.map((sub, idx) => (
              <tr key={sub.name + "-rmprice"}>
                <td className="border px-2 py-2 font-bold bg-yellow-50">
                  Raw Material
                </td>
                <td className="border px-2 py-2 font-bold bg-yellow-50">
                  {sub.name ?? "-"}
                </td>
                <td className="border px-2 py-2 bg-yellow-50" colSpan={5}>
                  Raw Material Price
                </td>
                {months.map((month) => (
                  <td
                    key={month}
                    className="border px-2 py-2 text-center bg-yellow-50"
                  >
                    {sub.prices[month] !== undefined &&
                    sub.prices[month] !== null
                      ? sub.prices[month]
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}
            {/* Consumptions per kg for each raw material */}
            <tr className="bg-blue-200 font-bold">
              <td className="border px-2 py-2" colSpan={7}>
                Consumptions per kg (Raw Materials)
              </td>
              {months.map((month) => (
                <td
                  key={month}
                  className="border px-2 py-2 text-center font-bold bg-blue-200"
                ></td>
              ))}
            </tr>
            {substituteMaterials.map((mat, idx) => (
              <tr key={mat.material + "-consumption"}>
                <td className="border px-2 py-2">Raw Material</td>
                <td className="border px-2 py-2">{mat.material ?? "-"}</td>
                <td className="border px-2 py-2">{mat.chemical ?? "-"}</td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={inputRM[mat.material]?.moles ?? ""}
                    onChange={(e) =>
                      handleInputRMChange(mat.material, "moles", e.target.value)
                    }
                    className="border px-1 py-0.5 w-16 text-center"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={inputRM[mat.material]?.molecular_weight ?? ""}
                    onChange={(e) =>
                      handleInputRMChange(
                        mat.material,
                        "molecular_weight",
                        e.target.value
                      )
                    }
                    className="border px-1 py-0.5 w-16 text-center"
                  />
                </td>
                <td className="border px-2 py-2">
                  {inputRM[mat.material] &&
                  inputRM[mat.material].moles !== undefined &&
                  inputRM[mat.material].molecular_weight !== undefined
                    ? getActualQuantity(mat.material).toFixed(2)
                    : "-"}
                </td>
                <td className="border px-2 py-2">
                  {inputRM[mat.material] &&
                  inputRM[mat.material].moles !== undefined &&
                  inputRM[mat.material].molecular_weight !== undefined
                    ? getTonPerTon(mat.material).toFixed(2)
                    : "-"}
                </td>
                {months.map((month) => {
                  const val = getConsumptionPerKg(mat.material, month);
                  return (
                    <td key={month} className="border px-2 py-2 text-center">
                      {val !== undefined &&
                      val !== null &&
                      !isNaN(val) &&
                      val !== 0
                        ? val.toFixed(2)
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Total RMC row */}
            <tr>
              <td
                className="border px-2 py-2 font-bold bg-blue-200"
                colSpan={7}
              >
                Total RMC
              </td>
              {months.map((month) => {
                const val = getTotalRMC(month);
                return (
                  <td
                    key={month}
                    className="border px-2 py-2 text-center font-bold bg-blue-200"
                  >
                    {val !== undefined &&
                    val !== null &&
                    val !== "0.00" &&
                    val !== "NaN"
                      ? val
                      : "-"}
                  </td>
                );
              })}
            </tr>
            {/* DKC - Purchase Price row */}
            <tr>
              <td
                className="border px-2 py-2 font-bold bg-blue-200"
                colSpan={7}
              >
                Delta (my Purchase Price - Total RMC)
              </td>
              {months.map((month) => {
                const val = getPurchasePrice(month);
                return (
                  <td
                    key={month}
                    className="border px-2 py-2 text-center font-bold bg-blue-200"
                  >
                    {val !== undefined &&
                    val !== null &&
                    val !== "0.00" &&
                    val !== "NaN"
                      ? val
                      : "-"}
                  </td>
                );
              })}
            </tr>
            {/* Delta row */}
            <tr>
              <td className="border px-2 py-2 font-bold bg-blue-50" colSpan={7}>
                Min Delta
              </td>
              {months.map((month) => {
                const purchasePrice = getPurchasePrice(month);
                return (
                  <td
                    key={month}
                    className="border px-2 py-2 text-center font-bold bg-blue-50"
                  >
                    {purchasePrice !== undefined &&
                    purchasePrice !== null &&
                    purchasePrice !== "-" &&
                    purchasePrice !== "0.00" &&
                    purchasePrice !== "NaN"
                      ? minPurchasePrice
                      : "-"}
                  </td>
                );
              })}
            </tr>
            {/* Should be price row */}
            <tr>
              <td className="border px-2 py-2 font-bold bg-blue-50" colSpan={7}>
                Should be price (Total RMC + Min Delta)
              </td>
              {months.map((month) => {
                const purchasePrice = getPurchasePrice(month);
                const val = getShouldBePrice(month);
                return (
                  <td
                    key={month}
                    className="border px-2 py-2 text-center font-bold bg-blue-50"
                  >
                    {purchasePrice !== undefined &&
                    purchasePrice !== null &&
                    purchasePrice !== "-" &&
                    purchasePrice !== "0.00" &&
                    purchasePrice !== "NaN"
                      ? val
                      : "-"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialSheet;
