import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export function SearchBar({ value, onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        placeholder="Search by name or ID..."
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="w-64 pl-10"
      />
    </div>
  );
}