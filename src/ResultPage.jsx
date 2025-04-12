import { useLocation, useNavigate } from 'react-router-dom';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const personData = location.state?.personData;

    if (!personData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl text-red-500 mb-4">No data available</h1>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Back to Camera
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-white">Verification Result</h1>
                            <div className="bg-white rounded-full p-2">
                                <div className="text-green-500 text-2xl">✓</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6">
                        {/* Captured Image */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Captured Image
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                                <div className="relative">
                                    <img 
                                        src={personData.capturedImage} 
                                        alt="Verified Face"
                                        className="rounded-lg shadow-lg max-w-full"
                                        style={{ maxHeight: '360px' }}
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Verified
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Person Info */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-lg font-medium text-gray-900">{personData.name}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Confidence Score</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {(personData.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Match Details */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Match Details
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        personData.matched ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <p className="text-lg font-medium text-gray-900">
                                        {personData.matched ? 'Verified Match' : 'No Match Found'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Back to Camera
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;