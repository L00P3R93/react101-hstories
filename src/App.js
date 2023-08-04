import * as React from 'react'
import axios from 'axios'

//import './App.css'

import styles from './App.module.css'

import {ReactComponent as Check} from './check.svg'

const API_ENDPOINT = 'http://hn.algolia.com/api/v1/search?query='


const useSemiPersistentState = (key, initialState) => {
	/**React State */
	const [value, setValue] = React.useState(
		localStorage.getItem(key) || initialState
	)

	React.useEffect(() => {
		localStorage.setItem(key, value)
	}, [value, key])

	return [value, setValue]
}

const storiesReducer = (state, action) => {
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

const getSumComments = (stories) => {
	console.log('C')
	return stories.data.reduce(
		(result, value) => result + value.num_comments,
		0
	)
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

	const handleRemoveStory = (item) => {
		dispatchStories({
			type: 'REMOVE_STORY',
			payload: item
		})
	}
	
	const handleSearchInput = (event) => {
		setSearchTerm(event.target.value)
	}
	const handleSearchSubmit = (event) => {
		setUrl(`${API_ENDPOINT}${searchTerm}`)
		event.preventDefault();
	}

	const sumComments = React.useMemo(() => getSumComments(stories), [stories,]) 

	return (
		<div className={styles.container}>
			<h1 className={styles.headlinePrimary}>Hacker Stories with {sumComments} comments</h1>
			
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

const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit}) => (
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

const InputWithLabel = ({id, value, type='text', onInputChange, isFocused, children,}) => {
	const inputRef = React.useRef()
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


const List = ({list, onRemoveItem}) => (
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

const Item = ({item, onRemoveItem}) => (
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