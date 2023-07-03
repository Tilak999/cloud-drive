import {
	Box,
	Flex,
	Heading,
	HStack,
	IconButton,
	Input,
	Spacer,
	Tooltip,
	useBreakpointValue
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { GoSearch, GoSync } from 'react-icons/go';
import { VscArrowLeft } from 'react-icons/vsc';
import DeleteFileBtn from './ActionButtons/DeleteFileBtn';
import MoveBtn from './ActionButtons/MoveBtn';
import NewFolderBtn from './ActionButtons/NewFolderBtn';
import RenameBtn from './ActionButtons/RenameBtn';
import If from './If';

export default function FileListHeader({
	title,
	fileCount,
	selection,
	folderId,
	onRefresh,
	iconOnly
}) {
	const router = useRouter();
	const breakPt = useBreakpointValue({ base: 'base', md: 'md' });

	return (
		<Flex my='2'>
			<If condition={breakPt == 'md'}>
				<Box pl='3' my='auto'>
					<Heading
						size='md'
						maxW='xl'
						className='whitespace-nowrap overflow-hidden text-ellipsis'
					>
						<If condition={folderId != 'root'}>
							<IconButton
								icon={<VscArrowLeft />}
								aria-label={'back'}
								variant='ghost'
								onClick={() => router.back()}
								mr='4'
							/>
						</If>
						<Tooltip label={title} hasArrow color='gray.300' bg='gray.900'>
							{title}
						</Tooltip>
					</Heading>
				</Box>
				<Spacer />
			</If>
			<Box my='2' mx='1' borderRight={'1px'} borderColor='gray.600'>
				<HStack px='3'>
					<If condition={selection.length == 0}>
						<If condition={breakPt == 'md'}>
							<Input variant='filled' placeholder='Search' />
						</If>
						<If condition={breakPt == 'base'}>
							<IconButton
								icon={<GoSearch />}
								aria-label={'reload'}
								onClick={onRefresh}
							/>
						</If>
					</If>
					{/* <If condition={fileCount.length}>
						<Tooltip label={fileCount} hasArrow color='gray.300' bg='gray.900'>
							Files: {fileCount}
						</Tooltip>
					</If> */}
					<If condition={selection.length == 1}>
						<RenameBtn file={selection[0]} onRefresh={onRefresh} iconOnly={iconOnly} />
					</If>
					<If condition={selection.length > 0}>
						<MoveBtn selection={selection} onRefresh={onRefresh} iconOnly={iconOnly} />
						<DeleteFileBtn
							selection={selection}
							onRefresh={onRefresh}
							iconOnly={iconOnly}
						/>
					</If>
				</HStack>
			</Box>
			<Box mx='2' my='2'>
				<NewFolderBtn
					currentFolderId={folderId}
					onRefresh={onRefresh}
					iconOnly={iconOnly}
				/>
				<IconButton icon={<GoSync />} mx='2' aria-label={'reload'} onClick={onRefresh} />
			</Box>
		</Flex>
	);
}
