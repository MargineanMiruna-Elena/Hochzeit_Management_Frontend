import React, {useState} from "react";

export default function ParticipantsManagement({ participants = [], onChange }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdate = (index, field, value) => {
        const updated = [...participants];
        updated[index][field] = value;
        onChange?.(updated);
    };

    const handleRemove = (index) => {
        const updated = participants.filter((_, i) => i !== index);
        onChange?.(updated);
    };

    const handleAdd = () => {
        const updated = [...participants, { name: "", email: "" }];
        onChange?.(updated);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Acceptă doar Excel
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            setError("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload-participants", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Upload failed");
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                onChange?.([...participants, ...data]);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };


    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-lg tracking-wide">Participants</h2>

                <div className="flex gap-2">
                    {/* Import Excel */}
                    <label className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-theme-pink text-white font-semibold hover:opacity-90 cursor-pointer">
                        Import Excel
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>

                    {/* Add participant */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-green-500 text-white font-semibold hover:opacity-90 transition"
                    >
                        Add Participant
                    </button>
                </div>
            </div>

            {participants.length === 0 ? (
                <div className="text-gray-500 text-sm">No participants yet. Add one or import from Excel.</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Name"
                                value={p.name || ""}
                                onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                                className="border rounded px-2 py-1 flex-1"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={p.email || ""}
                                onChange={(e) => handleUpdate(idx, "email", e.target.value)}
                                className="border rounded px-2 py-1 flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
