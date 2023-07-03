import { useBreakpointValue } from '@chakra-ui/react';
import FileList from '@components/FileList';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Dashboard() {
	const [directoryId, setDirectoryId] = useState();
	const router = useRouter();
	const breakPt = useBreakpointValue({ base: 'base', md: 'md' });

	return (
		<div className='flex flex-col h-screen overflow-hidden'>
			<div className='flex flex-none p-3 border-b border-grey'>
				<Header />
			</div>
			<div className='flex-1 overflow-hidden'>
				<div className='flex h-full'>
					{breakPt == 'md' && (
						<div className='w-72 h-full px-3 overflow-y-auto'>
							<Sidebar directoryId={directoryId} />
						</div>
					)}
					<div className='flex flex-col flex-1 h-full overflow-hidden'>
						<FileList
							folderId={router.query.id || 'root'}
							onDirectoryChange={setDirectoryId}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
