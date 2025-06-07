function LoadingScreen({ isVisible }) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-pulse flex flex-col items-center space-y-4">
                <div className="text-slate-600 text-xl font-medium">DocuLink</div>
                <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-600 rounded w-24"></div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-slate-600 rounded col-span-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingScreen;