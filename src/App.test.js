import * as React from 'react'

import App, {
	storiesReducer,
	Item,
	List,
	SearchForm,
	InputWithLabel
} from './App'

import {render,screen,fireEvent,act} from '@testing-library/react'

import axios from 'axios'


const storyOne = {
	title: 'React',
	url: 'https://reactjs.org/',
	author: 'Jordan Walke',
	num_comments:3,
	points: 4,
	objectID: 0,
};

const storyTwo = {
	title: 'Redux',
	url: 'https://redux.js.org/',
	author: 'Dan Abramov, Andrew Clark',
	num_comments:2,
	points: 5,
	objectID: 1,
};

const stories = [storyOne, storyTwo]

jest.mock('axios')

describe('storiesReducer', () => {
	test('removes a stroy from all stories', () => {
		const action = {type: 'REMOVE_STORY', payload: storyOne}
		const state = {data: stories, isLoading: false, isError: false}

		const newState = storiesReducer(state, action)

		const expectedState = {
			data: [storyTwo],
			isLoading: false,
			isError: false,
		}

		expect(newState).toStrictEqual(expectedState)
	})
})

describe('Item', () => {
	test('renders all properties', () => {
		render(<Item item={storyOne} />);
		
		expect(screen.getByText('Jordan Walke')).toBeInTheDocument()
		expect(screen.getByText('React')).toHaveAttribute(
			'href',
			'https://reactjs.org/'
		)
	});

	test('renders a clickable dismiss button', () => {
		render(<Item item={storyOne} />)
		expect(screen.getByRole('button')).toBeInTheDocument();
	})

	test('clicking the dismiss button calls the callback handler', () => {
		const handleRemoveItem = jest.fn();
		render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />)
		fireEvent.click(screen.getByRole('button'))
		expect(handleRemoveItem).toHaveBeenCalledTimes(1)
	})
});

describe('SearchForm', () => {
	const searchFormProps = {
		searchTerm: 'React',
		onSearchInput: jest.fn(),
		onSearchSubmit: jest.fn()
	}

	test('renders the input field with its value', () => {
		render(<SearchForm {...searchFormProps} />)
		expect(screen.getByDisplayValue('React')).toBeInTheDocument();
	})

	test('renders the correct label', () => {
		render(<SearchForm {...searchFormProps} />);
		expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
	})

	test('calls onSearchInput on input field change', () => {
		render(<SearchForm {...searchFormProps} />)
		fireEvent.change(screen.getByDisplayValue('React'), {target: {value: 'Redux'}})
		expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1)
	})

	test('class onSearchSubmit on submitting form', () => {
		render(<SearchForm {...searchFormProps} />)
		fireEvent.submit(screen.getByRole('button'))
		expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1)
	})

	test('renders snapshot', () => {
		const {container} = render(<SearchForm {...searchFormProps} />);
		expect(container.firstChild).toMatchSnapshot();
	})
})

describe('InputWithLabel', () => {
	const defaultProps = {
		id: 'test-id',
		value: 'test-value',
		onInputChange: jest.fn(),
		isFocused: false,
		children: 'Test Label',
	};

	
	test('renders correctly', () => {
		render(<InputWithLabel {...defaultProps} />)
		expect(screen.getByDisplayValue('test-value')).toBeInTheDocument();
		expect(screen.getByLabelText(/Test Label/)).toBeInTheDocument();
	})

	test('calls onInputChange when input value changes', () => {
		render(<InputWithLabel {...defaultProps} />)
		fireEvent.change(screen.getByRole('textbox', {name: 'Test Label'}), {target: {value: 'new-value'}})
		expect(defaultProps.onInputChange).toHaveBeenCalledWith(expect.any(Object))
		expect(defaultProps.onInputChange).toHaveBeenCalledTimes(1)
	})
})

describe('App', () => {
	test('succeeds fetching data', async () => {
		const promise = Promise.resolve({
			data: { hits: stories }
		})

		axios.get.mockImplementationOnce(() => promise)

		render(<App />);

		expect(screen.queryByText(/Loading/)).toBeInTheDocument();

		await act(() => promise);

		expect(screen.queryByText(/Loading/)).toBeNull()

		expect(screen.getByText('React')).toBeInTheDocument();
		expect(screen.getByText('Redux')).toBeInTheDocument();
		expect(screen.getAllByText('check.svg').length).toBe(2);
	})

	test('fails fetching data', async () => {
		const promise = Promise.reject();
		axios.get.mockImplementationOnce(() => promise);
		render(<App />)
		
		expect(screen.getByText(/Loading/)).toBeInTheDocument();
		try{
			await act(() => promise);
		}catch(error){
			expect(screen.queryByText(/Loading/)).toBeInTheDocument();
			expect(screen.queryByText(/went wrong/)).toBeNull();
		}
	})

	test('removes a story', async () => {
		const promise = Promise.resolve({
			data: {
				hits: stories
			}
		})

		axios.get.mockImplementationOnce(() => promise)

		render(<App />)
		await act(() => promise)

		expect(screen.queryAllByText('check.svg').length).toBe(2)
		expect(screen.getByText('Jordan Walke')).toBeInTheDocument();

		fireEvent.click(screen.getAllByText('check.svg')[0]);

		expect(screen.getAllByText('check.svg').length).toBe(1)
		expect(screen.queryByText('Jordan Walke')).toBeNull();
	})

	test('searches for specific stories', async () => {
		const reactPromise = Promise.resolve({
			data: { hits: stories }
		})

		const anotherStory = {
			title: 'JavaScript',
			url: 'https://en.wikipedia.org',
			author: 'Brendan Eich',
			num_comments: 15,
			points: 10,
			objectID: 3
		}

		const javaScriptPromise = Promise.resolve({
			data: { hits: [anotherStory] }
		})

		axios.get.mockImplementation((url) => {
			if(url.includes('React')){return reactPromise}
			if(url.includes('JavaScript')){return javaScriptPromise}
			throw Error();
		})

		render(<App />)
		await act(() => reactPromise)

		expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
		expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
		expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
		expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeInTheDocument();
		expect(screen.queryByText('Brendan Eich')).toBeNull();

		fireEvent.change(screen.queryByDisplayValue('React'), {target: {value: 'JavaScript'}});
		
		expect(screen.queryByDisplayValue('React')).toBeNull()
		expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

		fireEvent.submit(screen.queryByText('Submit'))

		await act(() => javaScriptPromise)

		expect(screen.queryByText('Jordan Walke')).toBeNull()
		expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeNull()
		expect(screen.queryByText('Brendan Eich')).toBeInTheDocument()
	})
})


