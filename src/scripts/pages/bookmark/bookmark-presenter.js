export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoriesListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showFavoriteStories() {
    this.#view.showMapLoading();
    try {
      await this.showStoriesListMap();

      const stories = await this.#model.getAllStories();
      if (stories.length === 0) {
        this.#view.populateBookmarkedStoriesListEmpty();
      } else {
        this.#view.populateBookmarkedStories(null, stories);
      }
    } catch (error) {
      console.error('bookmarkPresenter error:', error);
      this.#view.populateBookmarkedStoriesError('Gagal memuat cerita favorit');
    } finally {
      this.#view.hideMapLoading();
    }
  }
}