'use client';

import { useEffect, useState } from 'react';
import Navbar from "../../components/Navbar";
import FileExplorer from "../../components/FileExplorer";
import FileUpload from '../../components/FileUpload';
import FilePreview from '../../components/FilePreview';
import { getBuckets, getFiles, uploadFile, deleteFile, downloadFile, createFolder, FileItem, Bucket } from '../../actions/files';
import { useAuth } from '../../contexts/AuthContext';

export default function FilesPage() {
	const { authenticated, loading: authLoading, canReadFiles, canWriteFiles, canDeleteFiles } = useAuth();
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
	const [files, setFiles] = useState<FileItem[]>([]);
	const [currentPath, setCurrentPath] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [showUpload, setShowUpload] = useState<boolean>(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);

	useEffect(() => {
		if (!authenticated || !canReadFiles()) return;
		
		const fetchBuckets = async () => {
			try {
				setIsLoading(true);
				const bucketsData = await getBuckets();
				setBuckets(bucketsData);
				if (bucketsData.length > 0) {
					setSelectedBucket(bucketsData[0]);
				}
			} catch (error) {
				console.error('Failed to load buckets:', error);
				setError('Failed to load buckets');
			} finally {
				setIsLoading(false);
			}
		};
		fetchBuckets();
	}, [authenticated]);

	useEffect(() => {
		if (selectedBucket && authenticated && canReadFiles()) {
			loadFiles();
		}
	}, [selectedBucket, currentPath, authenticated]);

	// Authentication and authorization checks
	if (authLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!authenticated) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
						<p className="text-gray-600 mb-4">Please sign in to access the file manager.</p>
					</div>
				</div>
			</div>
		);
	}

	if (!canReadFiles()) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
							<svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
						<p className="text-gray-600 mb-4">You don't have permission to access the file manager.</p>
						<p className="text-sm text-gray-500">Required roles: file-manager-read, file-manager-write, file-manager-admin, or admin</p>
					</div>
				</div>
			</div>
		);
	}

	const loadFiles = async () => {
		if (!selectedBucket) return;

		try {
			setIsLoading(true);
			setError(null);
			const filesData = await getFiles(selectedBucket.name, currentPath);
			setFiles(filesData);
		} catch (error) {
			console.error('Failed to load files:', error);
			setError('Failed to load files');
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = (file: FileItem) => {
		setSelectedFile(file);
		if (!file.isFolder) {
			setShowPreview(true);
		}
	};

	const handleFolderOpen = (folderName: string) => {
		const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
		setCurrentPath(newPath);
	};

	const handleBackNavigation = () => {
		const pathParts = currentPath.split('/');
		pathParts.pop();
		setCurrentPath(pathParts.join('/'));
	};

	const handleUpload = async (files: File[]) => {
		if (!selectedBucket || !canWriteFiles()) return;

		try {
			setIsLoading(true);
			for (const file of files) {
				await uploadFile(selectedBucket.name, currentPath, file);
			}
			await loadFiles();
			setShowUpload(false);
		} catch (error) {
			console.error('Failed to upload files:', error);
			setError('Failed to upload files');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (fileName: string) => {
		if (!selectedBucket || !canDeleteFiles()) return;

		if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

		try {
			setIsLoading(true);
			const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
			await deleteFile(selectedBucket.name, fullPath);
			await loadFiles();
			if (selectedFile?.name === fileName) {
				setSelectedFile(null);
				setShowPreview(false);
			}
		} catch (error) {
			console.error('Failed to delete file:', error);
			setError('Failed to delete file');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async (fileName: string) => {
		if (!selectedBucket) return;

		try {
			const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
			await downloadFile(selectedBucket.name, fullPath);
		} catch (error) {
			console.error('Failed to download file:', error);
			setError('Failed to download file');
		}
	};

	const handleCreateFolder = async (folderName: string) => {
		if (!selectedBucket || !canWriteFiles()) return;

		try {
			setIsLoading(true);
			const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
			await createFolder(selectedBucket.name, fullPath);
			await loadFiles();
		} catch (error) {
			console.error('Failed to create folder:', error);
			setError('Failed to create folder');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<div className="p-12 max-w-screen mx-auto bg-black text-white min-h-screen">
				<div className="bg-[#14151d] p-6 rounded-xl shadow-md space-y-4 mb-6">
					<h1 className="text-xl font-bold mb-2">File Manager</h1>
					<p className="text-sm text-gray-400">Manage your files and folders across different buckets</p>

					{error && (
						<div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
							{error}
						</div>
					)}
				</div>

				<div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
					{/* Sidebar - Buckets */}
					<div className="col-span-3 bg-[#14151d] rounded-xl shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4">Available Buckets</h2>
						{isLoading && buckets.length === 0 ? (
							<div className="text-gray-400 text-sm">Loading buckets...</div>
						) : (
							<div className="space-y-3">
								{buckets.map((bucket) => (
									<button
										key={bucket.name}
										onClick={() => {
											setSelectedBucket(bucket);
											setCurrentPath('');
										}}
										className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedBucket?.name === bucket.name
												? 'bg-[#2a2d3e] border-[#444654] text-white'
												: 'bg-[#1d1f2b] border-[#444654] hover:bg-[#2a2d3e] text-gray-200'
											}`}
									>
										<div className="flex items-center gap-3">
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
											</svg>
											<div>
												<div className="font-medium text-sm">{bucket.name}</div>
												<div className="text-xs text-gray-400">{bucket.permissions?.join(', ')}</div>
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Main Content - File Explorer */}
					<div className="col-span-6 bg-[#14151d] rounded-xl shadow-md p-6">
						<FileExplorer
							files={files}
							currentPath={currentPath}
							bucketName={selectedBucket?.name || ''}
							isLoading={isLoading}
							onFileSelect={handleFileSelect}
							onFolderOpen={handleFolderOpen}
							onBackNavigation={handleBackNavigation}
							onUpload={() => setShowUpload(true)}
							onDelete={handleDelete}
							onDownload={handleDownload}
							onCreateFolder={handleCreateFolder}
							canWrite={canWriteFiles()}
							canDelete={canDeleteFiles()}
						/>
					</div>

					{/* Right Panel - File Preview/Actions */}
					<div className="col-span-3 bg-[#14151d] rounded-xl shadow-md p-6">
						{showPreview && selectedFile ? (
							<FilePreview
								file={selectedFile}
								bucketName={selectedBucket?.name || ''}
								currentPath={currentPath}
								onClose={() => {
									setShowPreview(false);
									setSelectedFile(null);
								}}
								onDownload={() => handleDownload(selectedFile.name)}
								onDelete={() => handleDelete(selectedFile.name)}
								canDelete={canDeleteFiles()}
							/>
						) : (
							<div className="text-center text-gray-400 mt-8">
								<svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
								</svg>
								<p>Select a file to preview</p>
							</div>
						)}
					</div>
				</div>

				{/* Upload Modal */}
				{showUpload && (
					<FileUpload
						onUpload={handleUpload}
						onClose={() => setShowUpload(false)}
						isLoading={isLoading}
					/>
				)}
			</div>
		</div>
	);
}