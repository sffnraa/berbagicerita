export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #story;
  #dbModel;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#story = null;
    this.#dbModel = dbModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const story = await this.#apiModel.getDetailStory(this.#storyId);
      
      this.#story = story;
      this.#view.populateStoryDetailAndInitialMap(story.message, story);
    } catch (error) {
      console.error('showStoryDetailAndMap: error:', error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async favStory() {
    try {
      const story = await this.#apiModel.getDetailStory(this.#storyId);
      await this.#dbModel.putStory(story);
      this.#view.saveToFavoriteSuccessfully('Success to save to favorite');
    } catch (error) {
      console.error('favStory: error:', error);
      this.#view.saveToFavoriteFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.removeFromFavoriteSuccessfully('Success to remove from favorite');
    } catch (error) {
      console.error('removeStory: error:', error);
      this.#view.removeFromFavoriteFailed(error.message);
    }
  }
  
  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }
  async #isStorySaved() {
    return !!(await this.#dbModel.getDetailStory(this.#storyId));
  }
}