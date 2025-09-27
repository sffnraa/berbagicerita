import {
  generateLoaderAbsoluteTemplate,
  generateRemoveStoryButtonTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
} from '../../templates';
import StoryDetailPresenter from './detail-story-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as CityCareAPI from '../../data/api';
import Database from '../../data/database'; 

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: CityCareAPI,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();  
  }

  async populateStoryDetailAndInitialMap(message, story) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      lat: story.lat,
      lon: story.lon,
      createdAt: story.createdAt,
    });

    // Map
    await this.#presenter.showStoryDetailMap();
    if (this.#map) {
    const storyCoordinate = [story.lat, story.lon];
    const markerOptions = { alt: story.name };
    const popupOptions = { content: story.name };

    this.#map.changeCamera(storyCoordinate);
    this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
  } 
    // Actions buttons
    this.#presenter.showSaveButton();
  }

  populateStoryDetailError(message) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    })
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML = generateSaveStoryButtonTemplate();
    document.getElementById('story-detail-fav').addEventListener('click', async () => {
     await this.#presenter.favStory();
     await this.#presenter.showSaveButton();
    });
  }

  saveToFavoriteSuccessfully(message) {
    console.log(message);
  }

  saveToFavoriteFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML = generateRemoveStoryButtonTemplate();
    document.getElementById('story-detail-remove').addEventListener('click', async () => {
      await this.#presenter.removeStory();
      await this.#presenter.showSaveButton();
    });
  }

  removeFromFavoriteSuccessfully(message) {
    console.log(message);
  }

  removeFromFavoriteFailed(message) {
    alert(message);
  }

  showStoryDetailLoading() {
    document.getElementById('story-detail-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById('story-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showCommentsLoading() {
    document.getElementById('comments-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideCommentsLoading() {
    document.getElementById('comments-list-loading-container').innerHTML = '';
  }
}