import _get from 'lodash/get';

const DOI_BASE_URL = 'https://doi.org/';

const BASE_API_URL = 'https://api.altmetric.com/v1/doi/';

const TWEET_CELL_INDEX = 1;

const getDoiIds = (dataSet) => {
	return dataSet.rows.map((row) => {
		const firstLinkToDoi = ((row && row.cells) || [])
			.map(item => item && item.v)
			.filter(value => !!value)
			.find(value => value.startsWith(DOI_BASE_URL));
		if (!firstLinkToDoi) {
			return null;
		}
		const doiId = firstLinkToDoi.replace(DOI_BASE_URL, '');
		return doiId;
	});
};

const processTweetCounts = (tweetCounts, doiIds) => {
	const tweetCountsById = tweetCounts.reduce((acc, { count, id }) => ({
		...acc,
		[id]: count,
	}), {});
	const tweetCountsByIndex = doiIds.map(id => tweetCountsById[id]);
	return tweetCountsByIndex;
};

export const initialPatch = ({ rows, header, ...rest }) => {
	const newHeader = [...(header || [])];
	newHeader.splice(TWEET_CELL_INDEX, 0, '# of Tweets');
	const newRows = rows.map((row) => {
		const { cells } = row || {};
		const newCells = [...(cells || [])];
		newCells.splice(TWEET_CELL_INDEX, 0, {
			id: `${Math.random()}`.slice(2),
			v: '...',
			t: 'string',
		});
		return {
			...row,
			cells: newCells,
		};
	});
	return {
		...rest,
		rows: newRows,
		header: newHeader,
	};
};

const finalPatch = ({ rows, ...rest }, tweetCountsByIndex) => {
	const newRows = rows.map((row, rowIndex) => {
		const { cells } = row || {};
		const newCells = [...(cells || [])].map((item, index) => (
			TWEET_CELL_INDEX === index ? ({
				v: tweetCountsByIndex[rowIndex] || 'Error: no ID found',
				type: 'string',
				id: `${Math.random()}`.slice(2),
			}) : item
		));
		return {
			...row,
			cells: newCells,
		};
	});
	return {
		...rest,
		rows: newRows,
	};
};


export const fetchTweetCounts = async (sheet) => {
	const doiIds = getDoiIds(sheet);
	const doiIdsUnique = [...new Set(doiIds.filter(id => !!id))];

	const tweetCounts = await Promise.all(doiIdsUnique.map(
		id => fetch(`${BASE_API_URL}${id}`)
			.then(res => res.json())
			.then(res => ({ count: `${_get(res, 'cited_by_tweeters_count', '-')}`, id }))
			.catch(() => ({ count: 'Error fetching data', id })),
	));

	const tweetCountsByIndex = processTweetCounts(tweetCounts, doiIds);

	return finalPatch(sheet, tweetCountsByIndex);
};
