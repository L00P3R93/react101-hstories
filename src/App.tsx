import * as React from 'react';
import axios from 'axios';

import List from './List'
import SearchForm from './SearchForm';

import styles from './App.module.css'

type Story = {
	objectID: string;
	url: string;
	title: string;
	author: string;
	num_comments: number;
	points: number;
}

type Stories = Array<Story>

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
export default App;

export { storiesReducer };