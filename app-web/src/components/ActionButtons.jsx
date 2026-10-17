import { Eye, Pencil, Trash2 } from "lucide-react";

export function ViewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-md text-[#1E3A5F] hover:bg-[#1E3A5F]/10 transition-colors"
      title="Voir"
    >
      <Eye size={16} strokeWidth={2} />
    </button>
  );
}

export function EditButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-md text-[#1E3A5F] hover:bg-[#1E3A5F]/10 transition-colors"
      title="Modifier"
    >
      <Pencil size={16} strokeWidth={2} />
    </button>
  );
}

export function DeleteButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-md text-[#1E3A5F] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
      title="Supprimer"
    >
      <Trash2 size={16} strokeWidth={2} />
    </button>
  );
}