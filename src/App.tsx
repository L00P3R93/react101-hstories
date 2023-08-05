import * as React from 'react';
import axios from 'axios';

//import './App.css'

import styles from './App.module.css'

import {ReactComponent as Check} from './check.svg'

type Story = {
	objectID: string;
	url: string;
	title: string;
	author: string;
	num_comments: number;
	points: number;
}

type ItemProps = {
	item: Story;
	onRemoveItem: (item: Story) => void;
}

type Stories = Array<Story>

type ListProps = {
	list: Stories;
	onRemoveItem: (item: Story) => void;
}

type StoriesState = {
	data: Stories;
	isLoading: boolean;
	isError: boolean;
}


interface StoriesFetchInitAction {
	type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
	type: 'STORIES_FETCH_SUCCESS';
	payload: Stories;
}

interface StoriesFetchFailureAction {
	type: 'STORIES_FETCH_FAILURE'
}

interface StoriesRemoveAction {
	type: 'REMOVE_STORY';
	payload: Story;
}

type StoriesAction = 
	| StoriesFetchInitAction
	| StoriesFetchSuccessAction
	| StoriesFetchFailureAction
	| StoriesRemoveAction

const API_ENDPOINT = 'http://hn.algolia.com/api/v1/search?query='


const useSemiPersistentState = (
	key: string, 
	initialState: string
): [string, (newValue: string) => void] => {
	/**React State */
	const [value, setValue] = React.useState(
		localStorage.getItem(key) || initialState
	)

	React.useEffect(() => {
		localStorage.setItem(key, value)
	}, [value, key])

	return [value, setValue]
}

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
	switch(action.type) {
		case 'STORIES_FETCH_INIT':
			return {
				...state,
				isLoading: true,
				isError: false,
			};
		case 'STORIES_FETCH_SUCCESS':
			return {
				...state,
				isLoading: false,
				isError: false,
				data: action.payload
			};
		case 'STORIES_FETCH_FAILURE':
			return {
				...state,
				isLoading: false,
				isError: true
			}
		case 'REMOVE_STORY':
			return {
				...state,
				data: state.data.filter(
					(story) => action.payload.objectID !== story.objectID
				)
			}
		default:
			throw new Error();
	}
}

const App = () => {
	/**Custom State */
	const [searchTerm, setSearchTerm] = useSemiPersistentState('search','React')
	const [stories, dispatchStories] = React.useReducer(
		storiesReducer, 
		{ data: [], isLoading: false, isError: false }
	)
	const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)

	const handleFetchStories = React.useCallback( async () => {
		dispatchStories({ type: 'STORIES_FETCH_INIT' })
		
		try{
			const result = await axios.get(url)
			dispatchStories({
				type: 'STORIES_FETCH_SUCCESS',
				payload: result.data.hits,
			})
		}catch{
			dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
		}
	}, [url])
	
	React.useEffect(() => {
		handleFetchStories()
	}, [handleFetchStories]);

	const handleRemoveStory = (item: Story) => {
		dispatchStories({
			type: 'REMOVE_STORY',
			payload: item
		})
	}
	
	const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value)
	}
	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		setUrl(`${API_ENDPOINT}${searchTerm}`)
		event.preventDefault();
	}


	return (
		<div className={styles.container}>
			<h1 className={styles.headlinePrimary}>Hacker Stories</h1>
			
			<SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit} />
			
			{/** -- Conditional Rendering JSX
			 true && 'Hello World' => 'Hello World',
			 false && 'Hello World' => false,
			 */}
			{stories.isError && <p>Something went wrong ...</p>}
			{stories.isLoading ? (<p>Loading ...</p>) : (
				<List list={stories.data} onRemoveItem={handleRemoveStory} />
			)}
		</div>
	);
}

type SearchFormProps = {
	searchTerm: string;
	onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit} : SearchFormProps) => (
	<form onSubmit={onSearchSubmit} className={styles.searchForm}>
		<InputWithLabel 
			id="search" 
			value={searchTerm} 
			isFocused
			onInputChange={onSearchInput}>
			<strong>Search: </strong>
		</InputWithLabel>
		&nbsp;
		<button 
			type="submit" 
			disabled={!searchTerm}
			className={`${styles.button} ${styles.buttonLarge}`}>
			Submit
		</button>
	</form>
)

type InputWithLabelProps = {
	id: string;
	value: string;
	type?: string;
	onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isFocused?: boolean;
	children: React.ReactNode;
}

const InputWithLabel = ({id, value, type='text', onInputChange, isFocused, children,} : InputWithLabelProps) => {
	const inputRef = React.useRef<HTMLInputElement>(null!)
	React.useEffect(() => {
		if(isFocused && inputRef.current){
			inputRef.current.focus()
		}
	}, [isFocused])
	return (
		<>
			<label htmlFor={id} className={styles.label}>
				{children}
			</label>&nbsp;
			<input 
				ref={inputRef}
				id={id} 
				type={type} 
				value={value} 
				autoFocus={isFocused}
				onChange={onInputChange} 
				className={styles.input}
			/>
		</>
	)
}



const List = ({list, onRemoveItem} : ListProps) => (
	<ul>
		{list.map((item) => (
			<Item
				key={item.objectID}
				item={item}
				onRemoveItem={onRemoveItem}
			/>
		))}
	</ul>
)

const Item = ({item, onRemoveItem} : ItemProps) => (
	<li className={styles.item}>
		<span style={{ width: '40%' }}>
			<a href={item.url}>{item.title}</a>
		</span>&nbsp;
		<span style={{ width: '30%' }}>{item.author}</span>&nbsp;
		<span style={{ width: '10%' }}>{item.num_comments}</span>&nbsp;
		<span style={{ width: '10%' }}>{item.points}</span>&nbsp;
		<span style={{ width: '10%' }}>
			<button 
				type="button" 
				onClick={() => onRemoveItem(item)}
				className={`${styles.button} ${styles.buttonSmall}`}>
				<Check height="18px" width="18px" />
			</button>
		</span>
	</li>
)

export default App;