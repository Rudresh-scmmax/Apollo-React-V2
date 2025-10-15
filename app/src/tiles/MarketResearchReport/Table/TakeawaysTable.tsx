import React, { useState } from 'react';
import { Table, Input, Button, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { BsFileEarmarkText } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useBusinessAPI } from '../../../services/BusinessProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MarketItem {
    id: number;
    published_date: string;
    publication: string;
    report_link: string;
    takeaway: string;
}

interface Props {
    marketData: ReportData[];
    onDelete: (id: number) => void;
}

const EditableTakeawayTable: React.FC<Props> = ({ marketData, onDelete }) => {
    const { updateTakeaway } = useBusinessAPI();
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [editedText, setEditedText] = useState<string>('');

    const queryClient = useQueryClient();


    const isEditing = (record: MarketItem) => record.id === editingKey;

    const edit = (record: MarketItem) => {
        setEditingKey(record.id);
        setEditedText(record.takeaway);
    };

    const cancel = () => {
        setEditingKey(null);
        setEditedText('');
    };

    const saveTakeawayMutation = useMutation({
        mutationFn: ({ id, takeaway }: { id: number; takeaway: string }) =>
            updateTakeaway(id, takeaway),

        onSuccess: () => {
            message.success('Takeaway updated successfully');
            setEditingKey(null);
            queryClient.invalidateQueries({ queryKey: ['takeaways'] });

        },

        onError: (error: any) => {
            message.error(error.message || 'Error saving takeaway');
        },
    });


    const save = (record: MarketItem) => {
        saveTakeawayMutation.mutate({
            id: record.id,
            takeaway: editedText,
        });
    };


    const columns: ColumnsType<MarketItem> = [
        {
            title: 'Date',
            dataIndex: 'published_date',
            key: 'published_date',
            render: (date: string) =>
                new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
        },
        {
            title: 'Publication',
            dataIndex: 'publication',
            key: 'publication',
            render: (text: string) => (
                <div className="flex items-center">
                    <BsFileEarmarkText className="mr-2" />
                    {text}
                </div>
            ),
        },
        {
            title: 'Report Link',
            dataIndex: 'report_link',
            key: 'report_link',
            render: (link: string) => (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    View Report <FaExternalLinkAlt className="ml-2 text-xs" />
                </a>
            ),
        },
        {
            title: 'Key Takeaway',
            dataIndex: 'takeaway',
            key: 'takeaway',
            render: (text: string, record: MarketItem) =>
                isEditing(record) ? (
                    <div>
                        <Input.TextArea
                            rows={4}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                        />
                        <div className="mt-2 flex gap-2">
                            <Button type="primary" onClick={() => save(record)}>
                                Save
                            </Button>
                            <Button onClick={cancel}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDoubleClick={() => edit(record)}
                        className="cursor-pointer text-gray-700 whitespace-pre-wrap"
                    >
                        {text}
                    </div>
                ),
        },
        {
      title: "Actions",
      key: "actions",
      render: (_, record: MarketItem) => (
        <Button
          danger
          onClick={() => onDelete(record.id)}
        >
          Delete
        </Button>
      ),
      width: 100
    }
    ];

    return (
        <div className="overflow-x-auto">
            <Table
                dataSource={marketData}
                columns={columns}
                rowKey="id"
                pagination={false}
            />
        </div>
    );
};

export default EditableTakeawayTable;
