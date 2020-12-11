import React, { useState, useEffect, useContext } from 'react';
import Autosuggest from 'react-autosuggest';
import '../../../css/autosuggest.scss';
import { WorkspaceContext } from '../../context/WorkspaceContext';

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => {
    return (
        <div style={{ 'zIndex': '2' }}>
            {suggestion}
        </div>
    )
}

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (list, value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    console.log(list);

    const suggestions = inputLength === 0 ? [] : list.filter(table =>
        RegExp(inputValue).test(table.toLowerCase())
    );
    // console.log(suggestions);
    return suggestions
};

const getSuggestionValue = suggestion => suggestion;

const CustomAutoCompleteComp = ({ list, setTarget, isLoading, autoSuggestModalClassName }) => {

    const {
        tableLoading, tableSearching,
    } = useContext(WorkspaceContext);

    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(loading === true){
            setTarget(value);
            setLoading(false);
        }
    }, [loading])

    const onChange = (event, { newValue }) => {
        console.log(newValue)
        setValue(newValue)
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    const onSuggestionsFetchRequested = ({ value }) => {
        console.log('fetching suggestions... for value:', value)
        const suggestions = getSuggestions(list, value)
        setSuggestions(suggestions)
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    const onSuggestionsClearRequested = () => {
        setSuggestions([])
    };

    const inputProps = {
        // placeholder: list.length === 0 ? 'Search' : list.length + ' items',
        placeholder: 'Type in column name to filter',
        disabled: tableLoading || tableSearching,
        value,
        onChange
    };

    return (
        <div className={autoSuggestModalClassName} >
            < Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                highlightFirstSuggestion={true}
                onSuggestionSelected={() => {
                    setLoading(true)
                }}
            />
        </div>
    )
}

export default CustomAutoCompleteComp;