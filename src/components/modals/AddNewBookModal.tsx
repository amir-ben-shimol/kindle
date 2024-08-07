import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { UIModal } from '@/ui/UIModal';
import type { Book } from '@/lib/types/ui/book';
import { UIInput } from '@/ui/UIInput';
import { useBook } from '@/lib/hooks/useBooks';
import { UIBookCover } from '@/ui/UIBookCover';
import { useBooksStore } from '@/lib/store/useBooksStore';
import { getImageDominantColor } from '@/lib/utils/image';
import { onBlurActiveInput } from '@/lib/utils/input';
import { BookInfoModal } from './BookInfoModal';

type Props = {
	readonly isVisible: boolean;
	readonly onClose: VoidFunction;
};

export const AddNewBookModal = (props: Props) => {
	const { booksList } = useBooksStore();
	const { searchBooks } = useBook();
	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState<Book[]>([]);
	const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
	const [isBookInfoModalVisible, setIsBookInfoModalVisible] = useState(false);
	const [bookCoverBackgroundColors, setBookCoverBackgroundColors] = useState<string[]>(['#1e293b', '#404040']);

	const fetchBookCoverColors = async (bookCoverImage: string) => {
		const colors = await getImageDominantColor(bookCoverImage);

		if (colors.length > 0) {
			setBookCoverBackgroundColors(colors);
		}
	};

	const onFetchBooks = async (query: string) => {
		try {
			setIsLoading(true);
			const searchResults = await searchBooks(query);

			setResults(searchResults);
		} finally {
			setIsLoading(false);
		}
	};

	const onClose = () => {
		props.onClose();
		setResults([]);
	};

	const onClearInputValue = () => {
		setResults([]);
	};

	const handleBookSelect = async (book: Book) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
		setSelectedBook(book);

		if (book.bookCoverUrl) {
			await fetchBookCoverColors(book.bookCoverUrl);
		}

		setIsBookInfoModalVisible(true);
	};

	return (
		<>
			<UIModal scrollable={false} className="pb-20" modalHeaderTitle="Search your new book 😝" size="large" isOpen={props.isVisible} onClose={onClose}>
				<View className="w-full">
					<UIInput
						placeholder="Title or Author"
						autoFocus
						icon="search"
						className="mb-4"
						showClearButton
						debounceDelay={1000}
						debounceCallback={onFetchBooks}
						onClear={onClearInputValue}
					/>
					{results.length > 0 ? (
						<FlatList
							data={results}
							keyExtractor={(item) => item.bookId.toString()}
							className="w-full"
							renderItem={({ item }) => {
								const isInLibrary = booksList.some((book) => book.bookId === item.bookId);

								return (
									<TouchableOpacity className="mb-4 flex flex-row items-start" onPress={() => handleBookSelect(item)}>
										<UIBookCover book={item} className="mr-4" showInLibrary isInLibrary={isInLibrary} />
										<View className="flex flex-1">
											<Text className="-mt-1 text-lg font-bold">{item.title}</Text>
											<Text className="text-sm text-gray-600">{item.author}</Text>

											<Text className="text-sm text-gray-600">{`Year: ${item.yearPublished}`}</Text>
										</View>
									</TouchableOpacity>
								);
							}}
							onTouchStart={onBlurActiveInput}
						/>
					) : (
						<View className="flex h-3/5 items-center justify-center">
							{results.length === 0 && !isLoading ? (
								<Text className="text-center text-lg text-gray-600">No results found</Text>
							) : isLoading ? (
								<Image source={require('@/assets/gifs/book-loader.gif')} className="h-48 w-48" />
							) : null}
						</View>
					)}
				</View>
			</UIModal>
			<BookInfoModal
				book={selectedBook}
				isVisible={isBookInfoModalVisible}
				bookCoverBackgroundColors={bookCoverBackgroundColors}
				onSuccessfulAdd={onClose}
				onClose={() => setIsBookInfoModalVisible(false)}
			/>
		</>
	);
};
