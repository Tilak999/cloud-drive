import { Box, IconButton, Progress, Text } from '@chakra-ui/react';
import { humanFileSize } from '@lib/utils';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { GoSync } from 'react-icons/go';

export default function Storage() {
	const [isLoaded, setLoaded] = useState(false);

	const [storage, setStorage] = useState({
		limit: '~',
		usage: '~',
		free: '~',
		percentage: 100,
		loading: true
	});

	const loadInfo = useCallback(async () => {
		setStorage({
			limit: '~',
			usage: '~',
			free: '~',
			percentage: 100,
			loading: true
		});

		axios.get('/api/storageInfo').then(({ data }) => {
			const free = humanFileSize(data.limit - data.usage);
			const limit = humanFileSize(data.limit);
			const usage = humanFileSize(data.usage);
			const percentage = (data.usage / data.limit) * 100;
			const loading = false;
			setStorage({ limit, usage, free, percentage, loading });
		}).catch((error) => {
			setStorage({
				limit: '~',
				usage: '~',
				free: '~',
				percentage: 0,
				loading: false
			});
		});
	}, []);

	useEffect(() => {
		if (!isLoaded) loadInfo();
	}, [isLoaded, loadInfo]);

	return (
		<Box bgColor={'gray.700'} rounded='md' p='4'>
			<div className='flex flex-row justify-between'>
				<Text>Storage</Text>
				<IconButton
					size={'xs'}
					icon={<GoSync />}
					mx='2'
					aria-label={'reload'}
					onClick={loadInfo}
				/>
			</div>

			<Progress
				hasStripe={storage.loading}
				isAnimated={storage.loading}
				my='4'
				colorScheme='gray'
				size='sm'
				value={storage.percentage}
			/>
			<Text fontSize={'sm'} color='gray.400' py='1'>
				Used Space: {storage.usage}
			</Text>
			<Text fontSize={'sm'} color='gray.400' py='1'>
				Free Space: {storage.free}
			</Text>
			<Text fontSize={'sm'} color='gray.400' py='1'>
				Total Space: {storage.limit}
			</Text>
		</Box>
	);
}
