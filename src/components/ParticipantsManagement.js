import React, {useState} from "react";
import {
    PencilSquareIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import {PaperAirplaneIcon} from "@heroicons/react/16/solid";
import {Button} from "@material-tailwind/react";

export default function ParticipantsManagement({
                                                   participants = [],
                                                   onUpdate,
                                                   onDelete,
                                                   onSendEmails,
                                                   onSendEmail,
                                                   isSendingEmails
                                               }) {
    const [editIdx, setEditIdx] = useState(-1);
    const [tempRow, setTempRow] = useState(null);

    const startEdit = (index) => {
        setEditIdx(index);
        setTempRow({...participants[index]});
    };

    const handleTempChange = (field, value) => {
        setTempRow(prev => ({...prev, [field]: value}));
    };

    const saveEdit = () => {
        if (onUpdate && tempRow) {
            onUpdate(tempRow);
        }
        setEditIdx(-1);
        setTempRow(null);
    };

    const cancelEdit = () => {
        setEditIdx(-1);
        setTempRow(null);
    };

    const handleRemove = (participantId) => {
        if (editIdx !== -1) cancelEdit();
        if (onDelete) {
            onDelete(participantId);
        }
    };

    const getStatusWord = (status) => {
        if (status === true) return "Accepted";
        if (status === false) return "Denied";
        return "Pending";
    };

    const getStatusColor = (status) => {
        if (status === true) return "bg-green-100 text-green-800 border-green-200";
        if (status === false) return "bg-red-100 text-red-800 border-red-200";
        return "bg-gray-100 text-gray-800 border-gray-200";
    };

    return (
        <section className="bg-white rounded shadow-sm w-full">
            {participants.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-8">
                    No participants yet.
                </div>
            ) : (
                <>
                    <div className="w-full !border !border-gray-200 !rounded-xl !p-2">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <thead>
                            <tr>
                                <th className="px-2 py-2 text-left text-sm font-semibold text-pink-600 uppercase w-[30%]">Name</th>
                                <th className="px-2 py-2 text-left text-sm font-semibold text-pink-600 uppercase w-[30%]">Email</th>
                                <th className="px-2 py-2 text-left text-sm font-semibold text-pink-600 uppercase w-20">Attending</th>
                                <th className="px-2 py-2 text-left text-sm font-semibold text-pink-600 uppercase w-12">Menu</th>
                                <th className="px-1 py-2 text-center text-sm font-semibold text-pink-600 uppercase w-12">Park</th>
                                <th className="px-2 py-2 text-center text-sm font-semibold text-pink-600 uppercase w-16">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {participants.map((p, idx) => {
                                const isEditing = editIdx === idx;
                                const data = isEditing ? tempRow : p;

                                return (
                                    <tr key={p.id || idx} className="hover:bg-gray-50 group">
                                        <td className="px-2 py-2 truncate align-middle">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => handleTempChange("name", e.target.value)}
                                                    className="w-full min-w-0 text-sm border-gray-300 rounded px-2 py-1 border focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-gray-900 truncate"
                                                     title={data.name}>{data.name}</div>
                                            )}
                                        </td>

                                        <td className="px-2 py-2 truncate align-middle">
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => handleTempChange("email", e.target.value)}
                                                    className="w-full min-w-0 text-sm border-gray-300 rounded px-2 py-1 border focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-500 truncate"
                                                     title={data.email}>{data.email}</div>
                                            )}
                                        </td>

                                        <td className="px-2 py-2 align-middle">
                                                <span
                                                    className={`px-2 py-0.5 inline-flex text-xs font-medium rounded border ${getStatusColor(data.attending)}`}>
                                                {getStatusWord(data.attending)}
                                            </span>
                                        </td>

                                        <td className="px-2 py-2 align-middle">
                                            <div className="text-sm text-gray-600 truncate" title={data.foodPreference}>
                                                {data.foodPreference || "-"}
                                            </div>

                                        </td>

                                        <td className="px-1 py-2 text-center align-middle">
                                                <span
                                                    className={`font-bold text-sm ${data.needsParking ? "text-green-600" : "text-gray-200"}`}>
                                                {data.needsParking ? "P" : "•"}
                                            </span>
                                        </td>

                                        <td className="px-2 py-2 text-right align-middle whitespace-nowrap">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
                                                        title="Save"
                                                    >
                                                        <CheckIcon className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                                                        title="Cancel"
                                                    >
                                                        <XMarkIcon className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => onSendEmail(p.id)}
                                                        disabled={isSendingEmails}
                                                        className="text-green-600 p-1 bg-green-50 rounded"
                                                        title="Invite"
                                                    >
                                                        <PaperAirplaneIcon className="h-4 w-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => startEdit(idx)}
                                                        className="text-indigo-800 p-1 bg-indigo-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(p.id)}
                                                        className="text-red-600 p-1 bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                    </div>
                    <div className="flex justify-end mt-2">
                        <Button
                            onClick={onSendEmails}
                            disabled={isSendingEmails}
                            className={`flex items-center gap-2
                            ${isSendingEmails
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"}
                            `}
                        >
                            {isSendingEmails ? (
                                <>
                                    <div
                                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45"/>
                                    Send Invitations to All
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}

        </section>
    );
}