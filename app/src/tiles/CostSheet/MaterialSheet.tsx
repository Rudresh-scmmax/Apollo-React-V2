import React, { useMemo, useState, useEffect } from "react";
import { Table, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useBusinessAPI } from "../../services/BusinessProvider";
import { convertApiToMaterialFormat } from "./CostsheetUtility";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ReactApexChart from "react-apexcharts";
import UploadSpendAnalysis from "../../common/UploadSpendAnalysis";
import UploadSettings from "../../common/UploadSettings";
import RegionSelector from "../../common/RegionSelector";
import PlantSelector from "../../common/PlantSelector";

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

const MaterialSheetAntd = () => {
  const { getMaterialSubtituteData, getRegions, getPlantCode } = useBusinessAPI();
  const selectedMaterial = useSelector(
    (state: RootState) => state.material.globalSelectedMaterial
  );
  const [showSpendAnalysis, setShowSpendAnalysis] = useState(false);
  const [showMaterialPriceHistory, setShowMaterialPriceHistory] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const { data: plantCodes } = useQuery<{plant_id: number, plant_name: string}[]>({
    queryKey: ["plantCodes", selectedMaterial?.material_id],
    queryFn: () => getPlantCode(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  const [selectedPlantCode, setSelectedPlantCode] = useState<string>("");

  // Update selectedPlantCode when plantCodes change
  useEffect(() => {
    if (plantCodes && plantCodes.length > 0 && !selectedPlantCode) {
      setSelectedPlantCode(plantCodes[0].plant_name);
    }
  }, [plantCodes, selectedPlantCode]);

  const { data: materialSubtituteData, isLoading } = useQuery({
    queryKey: [
      "materialSubtituteData",
      selectedMaterial?.material_id,
      selectedRegion,
      selectedPlantCode,
    ],
    queryFn: () =>
      getMaterialSubtituteData(
        selectedMaterial?.material_id || "",
        selectedPlantCode,
        selectedRegion
      ),
    enabled: !!selectedMaterial && !!selectedPlantCode && !!selectedRegion,
  });

  const { data: regions } = useQuery<{location_id: number, location_name: string}[]>({
    queryKey: ["regions", selectedMaterial?.material_id],
    queryFn: () =>
      getRegions(selectedMaterial?.material_id || ""),
    enabled: !!selectedMaterial?.material_id,
  });

  // Convert API data and destructure molecularWeights
  const { apiData, months, mainMaterialPriceHistory, subtractMaterialMeta, molecularWeights } = useMemo(() => {
    if (!materialSubtituteData)
      return {
        apiData: [],
        months: [],
        mainMaterialPriceHistory: [],
        subtractMaterialMeta: undefined,
        molecularWeights: {},
      };
    return convertApiToMaterialFormat(materialSubtituteData);
  }, [materialSubtituteData]);

  // Build substitutes from API response structure
  const substituteMaterials = useMemo(() => {
    if (!materialSubtituteData?.substitutes) return [];

    return materialSubtituteData.substitutes.map((sub: any) => {
      // Build prices object from raw_materials using material_name as key
      const prices: { [month: string]: number } = {};

      if (materialSubtituteData.raw_materials && materialSubtituteData.raw_materials[sub.material_name]) {
        materialSubtituteData.raw_materials[sub.material_name].forEach((entry: any) => {
          prices[entry.month] = parseFloat(entry.price_per_uom || entry.price || 0);
        });
      }

      return {
        material: sub.material_name,
        chemical: sub.material_name,
        moles: 1, // default value
        molecular_weight: molecularWeights[sub.material_id] || 0,
        prices: prices,
      };
    });
  }, [materialSubtituteData, molecularWeights]);

  // State for editable input (moles, molecular_weight, ton_per_ton)
  const [inputRM, setInputRM] = useState<
    Record<
      string,
      { moles: number; molecular_weight: number; ton_per_ton: number }
    >
  >({});

  useEffect(() => {
    if (materialSubtituteData?.main_material_id && molecularWeights) {
      const mainMaterialMW = molecularWeights[materialSubtituteData.main_material_id];
      if (mainMaterialMW) {
        let nextState: Record<string, { moles: number; molecular_weight: number; ton_per_ton: number }> = {};

        // Raw materials
        substituteMaterials.forEach((mat: any) => {
          const moles = 1;
          const molecular_weight = mat.molecular_weight || 0;
          const ton_per_ton = molecular_weight && mainMaterialMW ? molecular_weight / mainMaterialMW : 0;
          nextState[mat.material] = { moles, molecular_weight, ton_per_ton };
        });

        // Co-product (subtract material) initialization ✅
        if (materialSubtituteData?.subtract_material_id) {
          const coProductMW = molecularWeights[materialSubtituteData.subtract_material_id] || 0;
          const coProductTonPerTon = mainMaterialMW ? coProductMW / mainMaterialMW : 0;
          nextState[materialSubtituteData.subtract_material_id] = {
            moles: 1,
            molecular_weight: coProductMW,
            ton_per_ton: coProductTonPerTon,
          };
        }

        setInputRM(nextState);
      }
    }
  }, [substituteMaterials, materialSubtituteData, molecularWeights]);

  const handleInputRMChange = (
    material: string,
    field: "moles" | "molecular_weight" | "ton_per_ton",
    value: string
  ) => {
    setInputRM((prev) => {
      const prevObj = prev[material] || {};
      let moles = prevObj.moles || 1;
      let molecular_weight = prevObj.molecular_weight || 0;
      let ton_per_ton = prevObj.ton_per_ton || 0;
      const val = Number(value);

      // Get main material molecular weight for calculations - fully dynamic
      const mainMaterialMW = materialSubtituteData?.main_material_id
        ? molecularWeights[materialSubtituteData.main_material_id]
        : 0;

      if (!mainMaterialMW) return prev; // Cannot calculate without main material MW

      if (field === "ton_per_ton") {
        // ton_per_ton edited directly
        ton_per_ton = val;
        // Recalculate moles based on: ton_per_ton = (moles * raw_MW) / main_MW
        if (molecular_weight && mainMaterialMW) {
          moles = (ton_per_ton * mainMaterialMW) / molecular_weight;
        }
      } else if (field === "moles") {
        moles = val;
        // Recalculate ton_per_ton: ton_per_ton = (moles * raw_MW) / main_MW
        ton_per_ton = molecular_weight && mainMaterialMW ? (moles * molecular_weight) / mainMaterialMW : 0;
      } else if (field === "molecular_weight") {
        molecular_weight = val;
        // Recalculate ton_per_ton: ton_per_ton = (moles * raw_MW) / main_MW
        ton_per_ton = moles && mainMaterialMW ? (moles * molecular_weight) / mainMaterialMW : 0;
      }

      return {
        ...prev,
        [material]: { moles, molecular_weight, ton_per_ton },
      };
    });
  };

  // Helper functions
  const getMainMaterialPrice = (month: string): number => {
    if (!mainMaterialPriceHistory.length) return 0;

    const filtered = mainMaterialPriceHistory.filter(
      (row) => row.month === month
    );
    if (!filtered.length) return 0;

    const latest = filtered.reduce((a, b) =>
      new Date(a.po_date) > new Date(b.po_date) ? a : b
    );
    return parseFloat(latest.price) || 0;
  };

  const getPurchasePrice = (month: string): string => {
    const mainMaterialPrice = getMainMaterialPrice(month);
    const totalRMC = parseFloat(getTotalRMC(month));

    if (isNaN(mainMaterialPrice) || isNaN(totalRMC) || mainMaterialPrice === 0 || totalRMC === 0) {
      return "-";
    }

    return (mainMaterialPrice - totalRMC).toFixed(2);
  };

  const getRMPrice = (material: string, month: string): number | string => {
    const mat = substituteMaterials.find((m: any) => m.material === material);
    return mat && mat.prices[month] !== undefined ? mat.prices[month] : "-";
  };

  const getActualQuantity = (material: string) => {
    const { moles, molecular_weight } = inputRM[material] || {};
    if (moles === undefined || molecular_weight === undefined) return 0;
    // Actual quantity = moles * molecular_weight (in grams/mol terms)
    return moles * molecular_weight;
  };

  const getTonPerTon = (material: string) => {
    return inputRM[material]?.ton_per_ton || 0;
  };

  const getConsumptionPerKg = (material: string, month: string) => {
    const ton = getTonPerTon(material);
    const rm = getRMPrice(material, month);
    return typeof rm === "number" ? ton * rm : 0;
  };
  const getTotalRMC = (month: string): string => {
    let totalCredit = 0;

    // Sum raw material consumptions
    interface SubstituteMaterial {
      material: string;
      chemical: string;
      moles: number;
      molecular_weight: number;
      prices: { [month: string]: number };
    }

    type ConsumptionPerKgFn = (material: string, month: string) => number;

    const totalRawMaterials: number = substituteMaterials
      .map((mat: SubstituteMaterial) => getConsumptionPerKg(mat.material, month))
      .reduce((a: number, b: number) => a + b, 0);

    // Dynamic co-product credit calculation
    if (
      subtractMaterialMeta?.prices?.[month] &&
      materialSubtituteData?.subtract_material_id &&
      materialSubtituteData?.main_material_id
    ) {
      const coProductPrice = subtractMaterialMeta.prices[month];
      const coProductMW =
        molecularWeights[materialSubtituteData.subtract_material_id]; // Dynamic MW lookup
      const mainMaterialMW =
        molecularWeights[materialSubtituteData.main_material_id]; // Dynamic MW lookup

      if (coProductMW && mainMaterialMW && mainMaterialMW > 0) {
        const coProductCreditPerTon =
          coProductPrice * (coProductMW / mainMaterialMW);
        totalCredit = coProductCreditPerTon;
      }
    }

    const netRMC = totalRawMaterials - totalCredit;
    return netRMC > 0 ? netRMC.toFixed(2) : "0.00";
  };



  const minPurchasePrice = useMemo(() => {
    const prices = months
      .map((month) => parseFloat(getPurchasePrice(month)))
      .filter((val) => !isNaN(val) && val > 0);
    if (prices.length === 0) return "0.00";
    return Math.min(...prices).toFixed(2);
  }, [months, mainMaterialPriceHistory, substituteMaterials, inputRM]);

  const getShouldBePrice = (month: string): string => {
    const totalRMC = parseFloat(getTotalRMC(month));
    const minDelta = parseFloat(minPurchasePrice);
    if (isNaN(totalRMC) || isNaN(minDelta)) return "-";
    return (totalRMC + minDelta).toFixed(2);
  };

  // Chart data preparation
  const reversedMonths = [...months].reverse();
  const chartSeries = useMemo(() => {
    const purchasePricesData: (number | null)[] = [];
    const shouldBePricesData: (number | null)[] = [];

    reversedMonths.forEach((month) => {
      const mainPrice = getMainMaterialPrice(month);
      const shouldBePrice = parseFloat(getShouldBePrice(month));
      purchasePricesData.push(mainPrice > 0 ? mainPrice : null);
      shouldBePricesData.push(isNaN(shouldBePrice) ? null : shouldBePrice);
    });

    return [
      {
        name: "Purchase Price",
        data: purchasePricesData,
      },
      {
        name: "Should Be Price",
        data: shouldBePricesData,
      },
    ];
  }, [reversedMonths, mainMaterialPriceHistory, substituteMaterials, inputRM]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        height: 350,
        type: "line" as const,
        zoom: { enabled: false },
        toolbar: { show: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" as const, width: 2 },
      title: {
        text: "Purchase Price vs. Should Be Price",
        align: "left" as const,
        style: { fontSize: "16px", fontWeight: "bold", color: "#333" },
      },
      xaxis: {
        categories: reversedMonths,
        title: { text: "Month", style: { color: "#555", fontSize: "12px" } },
        labels: { style: { color: "#555", fontSize: "10px" } },
      },
      yaxis: {
        title: { text: "Price", style: { color: "#555", fontSize: "12px" } },
        labels: {
          formatter: (value: number) => value?.toFixed(2) || "0",
          style: { color: "#555", fontSize: "10px" },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => val?.toFixed(2) || "0"
        }
      },
      colors: ["#1A73E8", "#FF4560"],
    }),
    [reversedMonths]
  );

  // Define columns
  const columns = useMemo(() => {
    let commonCols: any[] = [
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 130,
        fixed: "left" as const,
        render: (text: any, record: any) => {
          if (record.key === "header_consumptions") {
            return {
              children: (
                <span style={{ fontWeight: "bold", fontSize: 16, color: "#285d9a" }}>
                  Consumptions per kg (Raw Materials)
                </span>
              ),
              props: { colSpan: 7, style: { background: "#f5f5f5" } },
            };
          }
          return { children: text, props: { style: { background: "#f5f5f5" } } };
        },
      },
      {
        title: "Material",
        dataIndex: "material",
        key: "material",
        width: 160,
        fixed: "left" as const,
        render: (_: any, record: any) => {
          if (record.key === "header_consumptions") {
            return { props: { colSpan: 0 } };
          }

          // Use displayName for co-product row if it exists, otherwise use material
          const displayText = record.displayName || record.material;

          return {
            children: displayText,
            props: { style: { background: "#f5f5f5" } }
          };
        },
      },
      // {
      //   title: "Moles",
      //   dataIndex: "moles",
      //   key: "moles",
      //   width: 100,
      //   render: (val: any, record: any) => {
      //     if (record.key === "header_consumptions") {
      //       return { props: { colSpan: 0 } };
      //     }
      //     return {
      //       children: record.inputEditable ? (
      //         <input
      //           type="number"
      //           value={inputRM[record.material]?.moles ?? ""}
      //           onChange={(e) =>
      //             handleInputRMChange(record.material, "moles", e.target.value)
      //           }
      //           style={{ width: 70, textAlign: "center" }}
      //         />
      //       ) : (
      //         val
      //       ),
      //       props: { style: { background: "#f5f5f5" } },
      //     };
      //   },
      // },
      // {
      //   title: "Molecular Weight",
      //   dataIndex: "molecular_weight",
      //   key: "molecular_weight",
      //   width: 130,
      //   render: (val: any, record: any) => {
      //     if (record.key === "header_consumptions") {
      //       return { props: { colSpan: 0 } };
      //     }
      //     return {
      //       children: record.inputEditable ? (
      //         <input
      //           type="number"
      //           value={inputRM[record.material]?.molecular_weight ?? ""}
      //           onChange={(e) =>
      //             handleInputRMChange(record.material, "molecular_weight", e.target.value)
      //           }
      //           style={{ width: 90, textAlign: "center" }}
      //         />
      //       ) : (
      //         val
      //       ),
      //       props: { style: { background: "#f5f5f5" } },
      //     };
      //   },
      // },
      // {
      //   title: "Actual Quantity",
      //   dataIndex: "actual_quantity",
      //   key: "actual_quantity",
      //   width: 120,
      //   render: (val: any, record: any) => {
      //     if (record.key === "header_consumptions") {
      //       return { props: { colSpan: 0 } };
      //     }
      //     return { children: val, props: { style: { background: "#f5f5f5" } } };
      //   },
      // },
      {
        title: "Ton/Ton",
        dataIndex: "ton_per_ton",
        key: "ton_per_ton",
        width: 90,
        render: (val: any, record: any) => {
          if (record.key === "header_consumptions") {
            return { props: { colSpan: 0 } };
          }
          return {
            children: record.inputEditable ? (
              <input
                type="number"
                step="0.0001"
                value={inputRM[record.material]?.ton_per_ton.toFixed(4) ?? ""}
                onChange={(e) =>
                  handleInputRMChange(record.material, "ton_per_ton", e.target.value)
                }
                style={{ width: 70, textAlign: "center" }}
              />
            ) : (
              val
            ),
            props: { style: { background: "#f5f5f5" } },
          };
        },
      }
    ];

    // Add month columns
    commonCols = [
      ...commonCols,
      ...months.map((month) => ({
        title: month,
        dataIndex: month,
        key: month,
        width: 110,
        align: "center" as const,
        render: (val: any, record: any) =>
          record.key === "header_consumptions"
            ? { props: { colSpan: 0 } }
            : val,
      })),
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 120,
        fixed: "right" as const,
        render: (val: any, record: any) =>
          record.key === "header_consumptions"
            ? { props: { colSpan: 0 } }
            : val,
      },
    ];
    return commonCols;
  }, [months, inputRM]);

  // Build the table data rows
  const dataSource = useMemo(() => {
    // Main Material row
    const mainMaterial = materialSubtituteData?.main_material_name ?? "-";
    const mainMaterialRow: any = {
      key: "main_material",
      type: "Our Material Price",
      material: mainMaterial,
      chemical: "-",
      moles: "-",
      molecular_weight: molecularWeights[materialSubtituteData?.main_material_id] || "-",
      actual_quantity: "-",
      ton_per_ton: "-",
      inputEditable: false,
      action: (
        <Button size="small" type="primary" onClick={() => setShowSpendAnalysis((prev) => !prev)}>
          Upload
        </Button>
      ),
    };

    months.forEach((month) => {
      const price = getMainMaterialPrice(month);
      mainMaterialRow[month] = price > 0 ? price.toFixed(2) : "-";
    });

    // Raw Material Price Rows for substitutes
    const rawMaterialPriceRows = substituteMaterials.map((sub: any) => {
      const row: any = {
        key: `raw_price_${sub.material}`,
        type: "Raw Material",
        material: sub.material,
        chemical: sub.chemical,
        moles: "-",
        molecular_weight: "-",
        actual_quantity: "-",
        ton_per_ton: "-",
        inputEditable: false,
        action: (
          <Button size="small" type="primary" onClick={() => setShowMaterialPriceHistory((prev) => !prev)}>
            Upload
          </Button>
        ),
      };
      months.forEach((month) => {
        row[month] = sub.prices[month] !== undefined ? sub.prices[month] : "-";
      });
      return row;
    });

    // Header row for consumptions
    const headerConsumptionRow = {
      key: "header_consumptions",
      type: "",
    };

    // Consumption rows
    const consumptionRows = substituteMaterials.map((mat: any) => {
      const row: any = {
        key: `consumption_${mat.material}`,
        type: "Raw Material",
        material: mat.material,
        chemical: mat.chemical,
        moles: inputRM[mat.material]?.moles ?? "",
        molecular_weight: inputRM[mat.material]?.molecular_weight ?? "",
        actual_quantity: getActualQuantity(mat.material).toFixed(2),
        ton_per_ton: inputRM[mat.material]?.ton_per_ton?.toFixed(4) ?? "0.0000",
        inputEditable: true,
        action: null,
      };
      months.forEach((month) => {
        const val = getConsumptionPerKg(mat.material, month);
        row[month] = typeof val === "number" && val > 0 ? val.toFixed(2) : "-";
      });
      return row;
    });
    console.log("subtractMaterialMeta:", materialSubtituteData);
    let subtractMaterialRow: any = null;
    if (subtractMaterialMeta && subtractMaterialMeta.subtract_material_name) {
      subtractMaterialRow = {
        key: "subtract_material",
        type: "Co-Product (Subtract)",
        material: materialSubtituteData?.subtract_material_id, // Use code as key for inputRM
        displayName: materialSubtituteData?.subtract_material_name, // For display
        chemical: "-",
        moles: inputRM[materialSubtituteData?.subtract_material_id]?.moles ?? 1,
        molecular_weight: inputRM[materialSubtituteData?.subtract_material_id]?.molecular_weight ?? molecularWeights[materialSubtituteData?.subtract_material_id],
        actual_quantity: (
          (inputRM[materialSubtituteData?.subtract_material_id]?.moles ?? 1) *
          (inputRM[materialSubtituteData?.subtract_material_id]?.molecular_weight ?? molecularWeights[materialSubtituteData?.subtract_material_id])
        ).toFixed(2),
        ton_per_ton: (inputRM[materialSubtituteData?.subtract_material_id]?.ton_per_ton ?? (molecularWeights[materialSubtituteData?.subtract_material_id] / molecularWeights[materialSubtituteData?.main_material_id])).toFixed(4),
        inputEditable: true,
        action: null,
      };
      months.forEach((month) => {
        const price = subtractMaterialMeta.prices?.[month] ?? 0;
        const coProductTonPerTon = molecularWeights[materialSubtituteData?.subtract_material_id] / molecularWeights[materialSubtituteData?.main_material_id];
        const creditValue = price * coProductTonPerTon;
        subtractMaterialRow[month] = price > 0 ? `-${creditValue.toFixed(2)}` : "-";
      });
    }


    // Total RMC row
    const totalRMCRow: any = {
      key: "total_rmc",
      type: "Total RMC",
      material: "-",
      chemical: "-",
      moles: "-",
      molecular_weight: "-",
      actual_quantity: "-",
      ton_per_ton: "-",
      inputEditable: false,
      action: null,
    };
    months.forEach((month) => {
      totalRMCRow[month] = getTotalRMC(month);
    });

    // Delta row
    const deltaRow: any = {
      key: "delta",
      type: "Delta (my Purchase Price - Total RMC)",
      material: "-",
      chemical: "-",
      moles: "-",
      molecular_weight: "-",
      actual_quantity: "-",
      ton_per_ton: "-",
      inputEditable: false,
      action: null,
    };
    months.forEach((month) => {
      deltaRow[month] = getPurchasePrice(month);
    });

    // Min Delta row
    const minDeltaRow: any = {
      key: "min_delta",
      type: "Min Delta",
      material: "-",
      chemical: "-",
      moles: "-",
      molecular_weight: "-",
      actual_quantity: "-",
      ton_per_ton: "-",
      inputEditable: false,
      action: null,
    };
    months.forEach((month) => {
      minDeltaRow[month] = minPurchasePrice;
    });

    // Should Be Price row
    const shouldBePriceRow: any = {
      key: "should_be_price",
      type: "Should Be Price (Total RMC + Min Delta)",
      material: "-",
      chemical: "-",
      moles: "-",
      molecular_weight: "-",
      actual_quantity: "-",
      ton_per_ton: "-",
      inputEditable: false,
      action: null,
    };
    months.forEach((month) => {
      shouldBePriceRow[month] = getShouldBePrice(month);
    });

    return [
      mainMaterialRow,
      ...rawMaterialPriceRows,
      headerConsumptionRow,
      ...consumptionRows,
      ...(subtractMaterialRow ? [subtractMaterialRow] : []),
      totalRMCRow,
      deltaRow,
      minDeltaRow,
      shouldBePriceRow,
    ];
  }, [
    materialSubtituteData,
    substituteMaterials,
    inputRM,
    months,
    mainMaterialPriceHistory,
    subtractMaterialMeta,
    minPurchasePrice,
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 24 }}>
            Cost Sheet for: {selectedMaterial?.material_description}
          </h1>
          <div className="flex items-center gap-4">
            <RegionSelector
              regions={regions?.map(region => region.location_name) || []}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
            <PlantSelector
              plantCodes={plantCodes?.map(plant => plant.plant_name) || []}
              selectedPlantCode={selectedPlantCode}
              setSelectedPlantCode={setSelectedPlantCode}
            />
          </div>
        </div>
      </div>

      {showSpendAnalysis && <UploadSpendAnalysis />}
      {showMaterialPriceHistory && <UploadSettings />}

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: Math.max(1500, months.length * 110 + 700) }}
        bordered
        size="small"
        style={{ background: "#fff", marginBottom: 32 }}
        rowClassName={(record) =>
          record.key === "header_consumptions" ? "ant-table-group-header" : ""
        }
      />

      <div style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 1px 4px #ddd" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 16 }}>
          Price Comparison Chart
        </h2>
        {isLoading ? (
          <div style={{ textAlign: "center", color: "#888" }}>Loading chart data...</div>
        ) : (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={350}
          />
        )}
      </div>
    </div>
  );
};

export default MaterialSheetAntd;