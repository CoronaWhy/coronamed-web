import _get from 'lodash/get';

const DOI_BASE_URL = 'https://doi.org/';

const BASE_API_URL = 'https://api.altmetric.com/v1/doi/';

const getDoiIds = (dataSet) => {
	return dataSet.map((row) => {
		const firstLinkToDoi = (row || []).find(item => item.startsWith(DOI_BASE_URL));
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

const patchWithTweetsNumbers = (result, tweetCountsByIndex) => {
	return result.map((row, index) => ([
		row[0],
		index === 0 ? '# of tweets' : (tweetCountsByIndex[index] || '-'),
		...row.slice(1)
	]));
};

export const fetchTweetCounts = async (dataSet) => {
	const doiIds = getDoiIds(dataSet);
	const doiIdsUnique = [...new Set(doiIds.filter(id => !!id))];
	const tweetCounts = await Promise.all(doiIdsUnique.map(
		id => fetch(`${BASE_API_URL}${id}`)
			.then(res => res.json())
			.then(res => ({ count: `${_get(res, 'cited_by_tweeters_count', '-')}`, id }))
	));
	const tweetCountsByIndex = processTweetCounts(tweetCounts, doiIds);
	const newDataSet = patchWithTweetsNumbers(dataSet, tweetCountsByIndex);
	return newDataSet;
};
