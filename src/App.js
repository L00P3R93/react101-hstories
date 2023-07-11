import * as React from 'react'

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

const App = () => {
	const stories = [
		{
			title: 'React',
			url: 'https://reactjs.org/',
			author: 'Jordan Walke',
			num_comments: 3,
			points: 4,
			objectID: 0
		},
		{
			title: 'Redux',
			url: 'https://redux.js.org/',
			author: 'Dan Abramov, Andrew Clark',
			num_comments: 2,
			points: 5,
			objectID: 1
		}
	];

	/**Custom State */
	const [searchTerm, setSearchTerm] = useSemiPersistentState('search','React')
	
	const handleSearch = (event) => {
		setSearchTerm(event.target.value)
	}

	const searchedStories = stories.filter((story)=>{
		return story.title.toLowerCase().includes(searchTerm.toLowerCase())
	})
	

	return (
		<div>
			<h1>Hacker Stories</h1>
			<InputWithLabel id="search" value={searchTerm} onInputChange={handleSearch}>
				<strong>Search: </strong>
			</InputWithLabel>
			<hr />
			{/* rendering the list */}
			<List list={searchedStories} />
		</div>
	);
}

const InputWithLabel = ({id, value, type='text', onInputChange, children,}) => (
	<>
		<label htmlFor={id}>{children}</label>&nbsp;
		<input 
			id={id} 
			type={type} 
			value={value} 
			onChange={onInputChange} 
		/>
	</>
)

const List = ({list}) => (
	<ul>
		{list.map(({objectID, ...item}) => (
			<Item key={objectID} {...item} />
		))}
	</ul>
)

const Item = ({title, url, author, num_comments, points}) => (
	<li>
		<span>
			<a href={url}>{title}</a>
		</span>&nbsp;
		<span>{author}</span>
		<span>{num_comments}</span>
		<span>{points}</span>
	</li>
)

export default App;