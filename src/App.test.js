import * as React from 'react'

import App, {
	storiesReducer,
	Item,
	List,
	SearchForm,
	InputWithLabel
} from './App'

import {render,screen,fireEvent,act} from '@testing-library/react'


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

	test('class onSearchInput on input field change', () => {
		render(<SearchForm {...searchFormProps} />)
		fireEvent.submit(screen.getByRole('button'))
		expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1)
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

