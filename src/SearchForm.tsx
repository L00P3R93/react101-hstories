import * as React from 'react';
import InputWithLabel from './InputWithLabel'

import styles from './App.module.css'

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
			Search:
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

export default SearchForm;