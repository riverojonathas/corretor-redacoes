import React from 'react';

export function MesaCorretorSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden animate-pulse">
            <div className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-5 shadow-sm z-10">
                <div className="flex flex-col gap-3">
                    <div className="h-7 w-64 bg-gray-100 rounded"></div>
                    <div className="h-4 w-40 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-gray-100 rounded-xl"></div>
                    <div className="h-10 w-32 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 border-r border-gray-100 p-8 lg:px-12 bg-[#fdfcf8]">
                    <div className="w-full flex justify-end mb-8"><div className="h-8 w-32 bg-gray-100 rounded-full border border-gray-200"></div></div>
                    <div className="space-y-5 max-w-[70ch] mx-auto opacity-60">
                        {[1, 2, 3, 4, 5, 6, 7].map(line => (<div key={line} className="h-6 bg-gray-200 rounded-sm w-full"></div>))}
                    </div>
                </div>
                <div className="w-1/2 p-8 lg:px-12 bg-gray-50/50">
                    <div className="flex bg-gray-100 p-1.5 rounded-lg space-x-2 mb-10 h-12 w-full"></div>
                    <div className="space-y-8">{[1, 2, 3].map(i => (<div key={i}><div className="h-4 w-48 bg-gray-100 rounded mb-3"></div><div className="h-14 bg-gray-100 rounded-xl w-full border border-gray-200"></div></div>))}</div>
                </div>
            </div>
        </div>
    );
}
