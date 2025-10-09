import React, { useState } from 'react';
import { Table, Input, Button, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { BsFileEarmarkText } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useBusinessAPI } from '../../../services/BusinessProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Update the ReportData interface to include upload_user_email and update_user_email
interface ReportData {
    id: number;
    published_date: string;
    publication: string;
    report_link: string;
    takeaway: string;
    upload_user_email: string | null; // Added
    update_user_email: string | null; // Added
}

// Assuming ReportData is the same as ReportData for this component's props
interface Props {
    marketData: ReportData[]; // Changed to ReportData[] for consistency
}

const EditableTakeawayTable: React.FC<Props> = ({ marketData }) => {
    const { updateTakeaway } = useBusinessAPI();
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [editedText, setEditedText] = useState<string>('');

    const queryClient = useQueryClient();

    const isEditing = (record: ReportData) => record.id === editingKey;

    const edit = (record: ReportData) => {
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

    const save = (record: ReportData) => {
        saveTakeawayMutation.mutate({
            id: record.id,
            takeaway: editedText,
        });
    };

    const columns: ColumnsType<ReportData> = [
        {
            title: 'Date',
            dataIndex: 'published_date',
            key: 'published_date',
            width: 120, // Example width in pixels
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
            width: 200, // Example width
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
            width: 150, // Example width
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
            title: 'Upload User', // New column
            dataIndex: 'upload_user_email',
            key: 'upload_user_email',
            width: 150, // Example width
        },
        {
            title: 'Update User', // New column
            dataIndex: 'update_user_email',
            key: 'update_user_email',
            width: 150, // Example width
            render: (email: string | null) => (email === null ? 'N/A' : email), // Corrected type for render parameter
        },
        {
            title: 'Key Takeaway',
            dataIndex: 'takeaway',
            key: 'takeaway',
            // No fixed width here allows it to take remaining space, or you can set a large one
            // width: 400, // Example large width if needed
            render: (text: string, record: ReportData) =>
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
    ];

    return (
        <div className="overflow-x-auto">
            <Table
                dataSource={marketData}
                columns={columns}
                rowKey="id"
                pagination={false}
                // Add scroll property for horizontal scrolling if widths exceed container
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default EditableTakeawayTable;