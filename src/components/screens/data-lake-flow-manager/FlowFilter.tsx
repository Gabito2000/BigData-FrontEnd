import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, TagIcon, X } from "lucide-react";
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
  tags,
  selectedTag,
  filterText,
  onFilterChange,
  onTagSelect,
  onClearFilters
}: FlowFilterProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border-b">
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
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedTag === tag.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTagSelect(tag.id)}
          >
            <TagIcon className="mr-2 h-3 w-3" />
            {tag.id} {tag.count && `(${tag.count})`}
          </Button>
        ))}
      </div>
    </div>
  );
}