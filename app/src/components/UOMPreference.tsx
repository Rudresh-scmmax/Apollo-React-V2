import React from 'react';
import { motion } from 'framer-motion';
import { Table, Form, Input, Select, Button, message } from 'antd';
import { useBusinessAPI } from '../services/BusinessProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MaterialWithUom } from '../services/BusinessProvider';
import type { ColumnsType, ColumnType } from 'antd/es/table';

interface UOMPreferenceData {
  key: string;
  material_id: string;
  material_name: string;
  hsn_code: string | null;
  cas_number: string | null;
  unspsc_code: string | null;
  base_uom_id: number;
  uom_display: string;
  is_preferred: boolean;
}

type EditableCellProps = React.HTMLAttributes<HTMLElement> & {
  editing?: boolean;
  dataIndex?: keyof UOMPreferenceData;
  columnTitle?: React.ReactNode;
  inputType?: 'text' | 'select';
  record?: UOMPreferenceData;
  index?: number;
  children: React.ReactNode;
  uomOptions?: { value: number; label: string }[];
  uomLoading?: boolean;
};

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  columnTitle,
  inputType,
  record,
  index,
  children,
  uomOptions,
  uomLoading,
  ...restProps
}) => {
  if (!editing || !dataIndex) {
    return <td {...restProps}>{children}</td>;
  }

  let inputNode: React.ReactNode = <Input placeholder={`Enter ${columnTitle}`} />;

  if (inputType === 'select') {
    inputNode = (
      <Select
        showSearch
        options={uomOptions}
        loading={uomLoading}
        placeholder="Select UOM"
        optionFilterProp="label"
      />
    );
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: dataIndex === 'base_uom_id', message: `Please input ${columnTitle}` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const UOMPreferencesPage: React.FC = () => {
  const { getMaterialsWithUom, getUomMaster, updateMaterialFields } = useBusinessAPI();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = React.useState<string>('');

  // Fetch materials with UOM information
  const { data: materialsWithUom, isLoading } = useQuery<MaterialWithUom[]>({
    queryKey: ['materialsWithUom'],
    queryFn: getMaterialsWithUom,
  });

  const { data: uomMaster, isLoading: isUomLoading } = useQuery({
    queryKey: ['uomMaster'],
    queryFn: getUomMaster,
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({
      materialId,
      payload,
    }: {
      materialId: string;
      payload: {
        cas_no?: string | null;
        hsn_code?: string | null;
        unspsc_code?: string | null;
        base_uom_id?: number | null;
      };
    }) => updateMaterialFields(materialId, payload),
    onSuccess: () => {
      message.success('Material updated successfully');
      setEditingKey('');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['materialsWithUom'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update material');
    },
  });

  const uomLookup = React.useMemo(() => {
    const map = new Map<number, { uom_name: string; uom_symbol: string | null }>();
    if (uomMaster) {
      uomMaster.forEach((uom) => {
        map.set(uom.uom_id, uom);
      });
    }
    return map;
  }, [uomMaster]);

  // Transform materials data for table
  const tableData: UOMPreferenceData[] = React.useMemo(() => {
    if (!materialsWithUom) return [];
    
    return materialsWithUom.map((material) => {
      const fallbackUom = uomLookup.get(material.base_uom_id);
      const resolvedName =
        material.uom?.uom_name ||
        material.uom_name ||
        fallbackUom?.uom_name ||
        null;
      const resolvedSymbol =
        material.uom?.uom_symbol ||
        material.uom_symbol ||
        fallbackUom?.uom_symbol ||
        null;

      const uomDisplay =
        resolvedName
          ? resolvedSymbol
            ? `${resolvedName} (${resolvedSymbol})`
            : resolvedName
          : 'N/A';
      
      return {
        key: material.material_id,
        material_id: material.material_id,
        material_name: material.material_description || material.material_id,
        hsn_code: material.hsn_code,
        cas_number: material.cas_no,
        unspsc_code: material.unspsc_code,
        base_uom_id: material.base_uom_id,
        uom_display: uomDisplay,
        is_preferred: material.uom?.is_preferred || material.is_preferred || false,
      };
    });
  }, [materialsWithUom, uomLookup]);

  const isEditing = (record: UOMPreferenceData) => record.key === editingKey;

  const edit = (record: UOMPreferenceData) => {
    form.setFieldsValue({
      cas_number: record.cas_number ?? '',
      hsn_code: record.hsn_code ?? '',
      unspsc_code: record.unspsc_code ?? '',
      base_uom_id: record.base_uom_id,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    form.resetFields();
  };

  const save = async (materialId: string) => {
    try {
      const row = await form.validateFields();
      const original = tableData.find((item) => item.material_id === materialId);
      if (!original) return;

      const normalizeValue = (value: string | null | undefined) => {
        if (value === null || value === undefined) return null;
        const trimmed = String(value).trim();
        return trimmed.length > 0 ? trimmed : null;
      };

      const payload: {
        cas_no?: string | null;
        hsn_code?: string | null;
        unspsc_code?: string | null;
        base_uom_id?: number | null;
      } = {};

      const casValue = normalizeValue(row.cas_number);
      if (casValue !== (original.cas_number ?? null)) {
        payload.cas_no = casValue;
      }

      const hsnValue = normalizeValue(row.hsn_code);
      if (hsnValue !== (original.hsn_code ?? null)) {
        payload.hsn_code = hsnValue;
      }

      const unspscValue = normalizeValue(row.unspsc_code);
      if (unspscValue !== (original.unspsc_code ?? null)) {
        payload.unspsc_code = unspscValue;
      }

      const uomValue = row.base_uom_id ?? null;
      if (uomValue !== original.base_uom_id) {
        payload.base_uom_id = uomValue;
      }

      if (Object.keys(payload).length === 0) {
        message.info('No changes detected');
        cancel();
        return;
      }

      updateMaterialMutation.mutate({
        materialId,
        payload,
      });
    } catch (err) {
      if ((err as any).errorFields) {
        message.error('Please fix validation errors before saving');
      }
    }
  };

  type EditableColumnType = ColumnType<UOMPreferenceData> & { editable?: boolean };

  const columns: EditableColumnType[] = [
    {
      title: 'Material Name',
      dataIndex: 'material_name',
      key: 'material_name',
      width: 250,
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'material_id',
      key: 'material_id',
      width: 150,
      render: (text: string) => (
        <span className="text-gray-700 font-mono text-sm">{text}</span>
      ),
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsn_code',
      key: 'hsn_code',
      width: 150,
      editable: true,
    },
    {
      title: 'CAS Number',
      dataIndex: 'cas_number',
      key: 'cas_number',
      width: 150,
      editable: true,
    },
    {
      title: 'UNSPSC Code',
      dataIndex: 'unspsc_code',
      key: 'unspsc_code',
      width: 150,
      editable: true,
    },
    {
      title: 'Base UOM',
      dataIndex: 'base_uom_id',
      key: 'base_uom_id',
      width: 140,
      editable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{record.uom_display}</span>
          {record.is_preferred && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#a0bf3f] text-white rounded">
              Preferred
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        if (editable) {
          return (
            <div className="flex gap-2">
              <Button
                type="primary"
                size="small"
                onClick={() => save(record.material_id)}
                loading={updateMaterialMutation.isPending}
              >
                Save
              </Button>
              <Button size="small" onClick={cancel} disabled={updateMaterialMutation.isPending}>
                Cancel
              </Button>
            </div>
          );
        }
        return (
          <Button
            size="small"
            onClick={() => edit(record)}
            disabled={editingKey !== '' || updateMaterialMutation.isPending}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  const uomOptions =
    uomMaster?.map((uom) => ({
      value: uom.uom_id,
      label: uom.uom_symbol ? `${uom.uom_name} (${uom.uom_symbol})` : uom.uom_name,
    })) ?? [];

  const mergedColumns: ColumnsType<UOMPreferenceData> = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: UOMPreferenceData) =>
        ({
          record,
          dataIndex: col.dataIndex!,
          columnTitle: col.title,
          editing: isEditing(record),
          inputType: col.dataIndex === 'base_uom_id' ? 'select' : 'text',
          uomOptions,
          uomLoading: isUomLoading,
        } as React.HTMLAttributes<HTMLElement>),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UOM Preferences</h1>
          <p className="text-gray-600">View material unit of measurement preferences</p>
          {isLoading && (
            <div className="text-sm text-blue-600 mt-2">Loading materials...</div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: (cellProps: any) => (
                      <EditableCell {...cellProps} uomOptions={uomOptions} uomLoading={isUomLoading} />
                    ),
                  },
                }}
                columns={mergedColumns as ColumnsType<UOMPreferenceData>}
                dataSource={tableData}
                loading={isLoading || updateMaterialMutation.isPending}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} materials`,
                  onChange: cancel,
                }}
                scroll={{ x: 1100 }}
                bordered
                rowClassName="editable-row"
              />
            </Form>
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#e4f0bb] border border-[#a0bf3f] rounded-xl p-4"
        >
          <p className="text-sm text-[#557a1a]">
            <strong>Note:</strong> This table displays all materials with their associated unit of measurement (UOM) preferences. The Base UOM ID represents the default unit of measurement for each material.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UOMPreferencesPage;

