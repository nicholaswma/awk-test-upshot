import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { type Tag } from '../utils/arweaveUtils';

type TagsDisplayProps = {
    tags: Tag[];
};
const TagsDisplay = (props: TagsDisplayProps) => {
    const { tags } = props;
    return (
        <div className="rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <div className="flex">
                        <div
                            key={index}
                            className="flex items-center rounded-md border border-purple-400 bg-slate-50 px-2 py-1 shadow-sm transition-all hover:shadow-md dark:bg-slate-900"
                        >
                            <TagIcon className="mr-2 h-4 w-4 text-purple-700 dark:text-purple-400" />
                            <span className="mr-2 font-medium text-purple-700 dark:text-purple-400">
                                {tag.name}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">
                                {tag.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagsDisplay;
