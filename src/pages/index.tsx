import {
	Box,
	Button,
	Center,
	Container,
	FormControl,
	FormLabel,
	Icon,
	Input,
	Text,
	useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { VscKey } from 'react-icons/vsc';

export default function Login() {
	const [isLoginForm, setLoginForm] = useState(true);
	const [isLoading, setLoading] = useState(false);
	const [keyFile, setKeyFile] = useState({ name: null, text: null });
	const fileInput = useRef(null);
	const toast = useToast();
	const router = useRouter();

	const parseKeyFile = async () => {
		const files = fileInput.current.files;
		if (files.length > 0) {
			setKeyFile({
				name: files[0].name,
				text: await files[0].text()
			});
		}
	};

	const validateInput = (e) => {
		const email = e.target[0].value;
		const password = e.target[1].value;
		if (email.trim() === '') throw 'Email is empty';
		if (password.trim() === '') throw 'Password is empty';
		if (!isLoginForm) {
			if (!keyFile || !keyFile.name || !keyFile.text) throw 'Invalid Key file selection';
			if (e.target[2].value !== password) throw "Password fields don't match";
		}
		return { email, password, keyFile };
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { email, password, keyFile } = validateInput(e);
			if (isLoginForm) {
				const { data } = await axios.post('/api/signin', { email, password });
				setLoading(false);
				if (data.uuid) {
					router.push('/dashboard');
				}
			} else {
				const key = {
					contents: keyFile.text
				};
				await axios.post('/api/signup', { email, password, key });
				setLoading(false);
				router.push('/dashboard');
			}
		} catch (error) {
			setLoading(false);
			if (!toast.isActive('authfail'))
				toast({
					id: 'authfail',
					title: error.response?.data,
					status: 'error',
					position: 'top',
					duration: 1000,
					isClosable: true
				});
		}
	};

	return (
		<Container h='100vh'>
			<Center h='100vh'>
				<Box shadow='md' rounded='md' p='6' w='full' maxW='25em' border='1px'>
					<Text fontSize={'1.4em'} pb='4'>
						Sign In
					</Text>
					<form onSubmit={handleSubmit}>
						<FormControl my='4'>
							<FormLabel htmlFor='email' color={'whiteAlpha.500'}>
								Email address
							</FormLabel>
							<Input id='email' type='email' autoComplete='username' />
						</FormControl>
						<FormControl my='4'>
							<FormLabel htmlFor='password' color={'whiteAlpha.500'}>
								Password
							</FormLabel>
							<Input id='password' autoComplete='current-password' type='password' />
						</FormControl>
						{!isLoginForm && (
							<FormControl my='4'>
								<FormLabel htmlFor='retypePassword' color={'whiteAlpha.500'}>
									Re-type Password
								</FormLabel>
								<Input id='retypePassword' type='password' />
							</FormControl>
						)}
						{!isLoginForm && (
							<Button onClick={() => fileInput.current.click()}>
								<Icon as={VscKey} mr='2'></Icon>{' '}
								{keyFile.name || 'Select Master Key'}
							</Button>
						)}
						<Button
							my='6'
							isLoading={isLoading}
							loadingText='Submitting'
							colorScheme='teal'
							type='submit'
						>
							Submit
						</Button>
					</form>
					<Button variant={'link'} onClick={() => setLoginForm(!isLoginForm)}>
						{isLoginForm ? 'Create Account' : 'Already have account? Sign in.'}
					</Button>
					<input
						type='file'
						ref={fileInput}
						style={{ display: 'none' }}
						onChange={parseKeyFile}
					></input>
				</Box>
			</Center>
		</Container>
	);
}
