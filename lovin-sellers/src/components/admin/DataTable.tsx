"use client";

import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Column<T> {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    editLink?: (item: T) => string;
}

export function DataTable<T extends { id: string }>({ data, columns, onEdit, onDelete, editLink }: DataTableProps<T>) {
    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th
                                            key={idx}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        {columns.map((col, idx) => (
                                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {col.cell
                                                    ? col.cell(item)
                                                    : typeof col.accessorKey === 'function'
                                                        ? col.accessorKey(item)
                                                        : (item[col.accessorKey] as React.ReactNode)
                                                }
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                {editLink ? (
                                                    <Link href={editLink(item)} className="text-indigo-600 hover:text-indigo-900">
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                ) : (
                                                    <button onClick={() => onEdit && onEdit(item)} className="text-indigo-600 hover:text-indigo-900">
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                )}

                                                {onDelete && (
                                                    <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
