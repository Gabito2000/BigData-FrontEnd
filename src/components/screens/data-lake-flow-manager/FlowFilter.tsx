import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FlowFilterProps {
  tags: { id: string; count?: number }[];
  selectedTag: string | null;
  filterText: string;
  onFilterChange: (text: string) => void;
  onTagSelect: (tagId: string | null) => void;
  onClearFilters: () => void;
}

export function FlowFilter({
  filterText,
  onFilterChange,
  onClearFilters
}: FlowFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter flows, pipelines, datasets..."
              className="pl-8"
              value={filterText}
              onChange={(e) => onFilterChange(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}