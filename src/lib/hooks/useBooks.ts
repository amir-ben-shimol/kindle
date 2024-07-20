/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseStringPromise } from 'xml2js';
import { BackendService } from '../utils/backend-service';
import type { Book, DescriptionAndReviewsCount } from '../types/ui/book';

const GOODREAD_BASE_URL = 'https://www.goodreads.com';

export const useBook = () => {
	const fetchBookImageUrl = async (bookId: number): Promise<string | undefined> => {
		try {
			const response = await BackendService.get<string>(`${GOODREAD_BASE_URL}/show/${bookId}.xml?key=${process.env.EXPO_PUBLIC_GOODREADS_API_KEY}`);
			const result = await parseStringPromise(response);
			const imageUrl = result?.GoodreadsResponse?.book?.[0]?.image_url?.[0];

			return imageUrl || undefined;
		} catch (error) {
			console.error('Error fetching book image URL:', error);

			return undefined;
		}
	};

	const getBookDescriptionAndReviewsCount = async (bookId: number): Promise<DescriptionAndReviewsCount | undefined> => {
		try {
			const response = await BackendService.get<string>(
				`${GOODREAD_BASE_URL}/book/show.xml?key=${process.env.EXPO_PUBLIC_GOODREADS_API_KEY}&id=${bookId}`,
			);

			const result = await parseStringPromise(response);

			console.log('result from api', result?.GoodreadsResponse?.book?.[0]);
			const textReviewsCount = result?.GoodreadsResponse?.book?.[0]?.text_reviews_count?.[0];
			const ratingCount = result?.GoodreadsResponse?.book?.[0]?.ratings_count?.[0];
			const description = result?.GoodreadsResponse?.book?.[0]?.description?.[0];

			return {
				description: description || '',
				textReviewsCount: textReviewsCount || '',
				ratingsCount: ratingCount || '',
			};
		} catch (error) {
			console.error('Error fetching book description:', error);

			return undefined;
		}
	};

	const searchBooks = async (query: string): Promise<Book[]> => {
		try {
			const response = await BackendService.get<string>(
				`https://www.goodreads.com/search/index.xml?key=${process.env.EXPO_PUBLIC_GOODREADS_API_KEY}&q=${query}`,
			);

			const result = await parseStringPromise(response);
			const works = result?.GoodreadsResponse?.search?.[0]?.results?.[0]?.work || [];

			return works.map((work: any): Book => {
				const bestBook = work.best_book[0];

				return {
					bookId: parseInt(bestBook.id[0]._),
					title: bestBook.title[0],
					author: bestBook.author[0].name[0],
					authorLf: '',
					additionalAuthors: '',
					isbn: '',
					isbn13: '',
					myRating: 0,
					averageRating: parseFloat(work.average_rating[0]),
					publisher: '',
					binding: '',
					numberOfPages: undefined,
					yearPublished: parseInt(work.original_publication_year[0]._),
					originalPublicationYear: parseInt(work.original_publication_year[0]._),
					dateRead: '',
					bookshelves: 'to-read',
					bookshelvesWithPositions: '',
					exclusiveShelf: 'to-read',
					myReview: '',
					spoiler: '',
					privateNotes: '',
					readCount: 0,
					ownedCopies: 0,
					bookCoverUrl: bestBook.image_url[0],
				};
			});
		} catch (error) {
			console.error('Error searching for books:', error);

			return [];
		}
	};

	return { fetchBookImageUrl, getBookDescriptionAndReviewsCount, searchBooks };
};
