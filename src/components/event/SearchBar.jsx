import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchBar = ({ value, onChange, onSearch }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search events..."
                    value={value}
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    className="pl-10 w-full"
                />
            </div>
            <Button
                onClick={onSearch}
                className="bg-primary hover:bg-primary/90"
            >
                Search
            </Button>
        </div>
    );
};

export default SearchBar;