import * as React from 'react'

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

export default List;
export {Item};