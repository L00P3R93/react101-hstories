import * as React from 'react'
import {sortBy} from 'lodash';

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

type SortKey = keyof typeof SORTS

const SORTS = {
    NONE: (list: Stories) => list,
    TITLE: (list: Stories) => sortBy(list, 'title'),
    AUTHOR: (list: Stories) => sortBy(list, 'author'),
    COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
    POINT: (list: Stories) => sortBy(list, 'points').reverse()
}

const List = ({list, onRemoveItem} : ListProps) => {
    const [sort, setSort] = React.useState({
        sortKey: 'NONE',
        isReverse: false
    })

    const handleSort = (sortKey: string) => {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse
        setSort({sortKey, isReverse}); 
    }

    const sortFunction: (list: Stories) => Stories = SORTS[sort.sortKey as SortKey]
    const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list)
    
    return (
        <ul>
            <li className={styles.item} onClick={() => handleSort('TITLE')}>
                <span style={{width: '40%' }}>
                    Title
                </span>
                <span style={{width: '30%' }} onClick={() => handleSort('AUTHOR')}>
                     Author
                </span>
                <span style={{width: '10%' }} onClick={() => handleSort('COMMENT')}>
                    Comments
                </span>
                <span style={{width: '10%' }} onClick={() => handleSort('POINT')}>
                    Points
                </span>
                <span style={{width: '10%' }}>Actions</span>
            </li>
            {sortedList.map((item) => (
                <Item
                    key={item.objectID}
                    item={item}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </ul>
    )
}

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