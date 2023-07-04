import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogCloseButton,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Icon,
	Table,
	TableContainer,
	Tbody,
	Td,
	Tr,
	useDisclosure
} from '@chakra-ui/react';
import axios from 'axios';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';

function FileList({ data, onSelect }) {
	const style = {
		background: 'gray.800'
	};
	return (
		<TableContainer w='full'>
			<Table variant='simple'>
				<Tbody>
					{data.parents && (
						<Tr _hover={style}>
							<Td onClick={() => onSelect(data.parents[0])} cursor='pointer'>
								<Icon as={GoFileDirectory} boxSize='6' verticalAlign={'bottom'} />
								<span style={{ marginLeft: '10px' }}>..</span>
							</Td>
						</Tr>
					)}
					{data.files.map((f) => {
						return (
							<Tr key={f.id + f.modifiedTime} _hover={style}>
								<Td onClick={() => onSelect(f.id)} cursor='pointer'>
									<Icon
										as={GoFileDirectory}
										boxSize='6'
										verticalAlign={'bottom'}
									/>
									<span style={{ marginLeft: '10px' }}>{f.name}</span>
								</Td>
							</Tr>
						);
					})}
				</Tbody>
			</Table>
		</TableContainer>
	);
}

export default function MoveBtn({ selection, onRefresh, iconOnly }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [data, setData] = useState({ id: '', files: [], name: '' });

	const loadFiles = useCallback(
		async (folderId) => {
			if (isLoading) return;
			setLoading(true);
			const { data } = await axios.post('/api/listFiles', { folderId });
			const selectedIds = _.map(selection, (file) => file.id);
			data.files = _.filter(
				data.files,
				(file) => !_.includes(selectedIds, file.id) && file.mimeType.endsWith('folder')
			);
			setData(data);
			setLoading(false);
		},
		[isLoading, selection]
	);

	const move = async () => {
		setLoading(true);
		await axios.post('/api/move', {
			sourceIds: selection.map((f) => f.id),
			destinationId: data.id
		});
		setLoading(false);
		onClose();
		onRefresh();
	};

	useEffect(() => {
		if (!data.id) {
			loadFiles('root');
		}
	}, [isOpen, loadFiles, data, setLoading]);

	return (
		<>
			<Button onClick={onOpen}>{iconOnly ? <GoFileDirectory /> : 'Move'}</Button>
			<AlertDialog
				motionPreset='slideInBottom'
				leastDestructiveRef={cancelRef}
				onClose={onClose}
				isOpen={isOpen}
				isCentered
			>
				<AlertDialogOverlay />
				<AlertDialogContent m='3'>
					<AlertDialogHeader>Select Folder</AlertDialogHeader>
					<AlertDialogCloseButton />
					<AlertDialogBody px='0' maxH={'450px'} overflowY='auto'>
						<Box px='6' py='2' fontSize={'sm'} color='gray.300'>
							Currently selected: {data.name}
						</Box>
						<FileList data={data} onSelect={loadFiles} />
					</AlertDialogBody>
					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose}>
							Cancel
						</Button>
						<Button ml={3} onClick={move} isLoading={isLoading}>
							Move
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
