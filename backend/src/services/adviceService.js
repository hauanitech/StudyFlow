/**
 * Study Advice Service
 * Provides study tips and strategies
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let adviceCache = null;

/**
 * Load advice data from JSON file
 */
async function loadAdvice() {
  if (adviceCache) {
    return adviceCache;
  }

  const dataPath = join(__dirname, '../data/studyAdvice.json');
  const data = await readFile(dataPath, 'utf-8');
  adviceCache = JSON.parse(data);
  return adviceCache;
}

/**
 * Get all advice items
 */
export async function getAllAdvice() {
  const advice = await loadAdvice();
  return advice.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    summary: item.summary,
    tags: item.tags,
  }));
}

/**
 * Get advice by ID
 */
export async function getAdviceById(id) {
  const advice = await loadAdvice();
  return advice.find(item => item.id === id) || null;
}

/**
 * Get advice by category
 */
export async function getAdviceByCategory(category) {
  const advice = await loadAdvice();
  return advice.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  ).map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    summary: item.summary,
    tags: item.tags,
  }));
}

/**
 * Search advice by query
 */
export async function searchAdvice(query) {
  const advice = await loadAdvice();
  const lowerQuery = query.toLowerCase();
  
  return advice.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.summary.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  ).map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    summary: item.summary,
    tags: item.tags,
  }));
}

/**
 * Get all categories
 */
export async function getCategories() {
  const advice = await loadAdvice();
  const categories = [...new Set(advice.map(item => item.category))];
  return categories.sort();
}

/**
 * Get all tags
 */
export async function getTags() {
  const advice = await loadAdvice();
  const tags = [...new Set(advice.flatMap(item => item.tags))];
  return tags.sort();
}

/**
 * Get advice by tag
 */
export async function getAdviceByTag(tag) {
  const advice = await loadAdvice();
  return advice.filter(item => 
    item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  ).map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    summary: item.summary,
    tags: item.tags,
  }));
}

export default {
  getAllAdvice,
  getAdviceById,
  getAdviceByCategory,
  searchAdvice,
  getCategories,
  getTags,
  getAdviceByTag,
};
