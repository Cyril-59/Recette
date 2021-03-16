import { Ingredient } from './ingredient';

export class Recette {
    id: number;
    titre: string;
    ingredients: Ingredient[];
    stringIngredients: string;
    tooltipIngredients: string;
    url: string;
    ete: boolean;
    hiver: boolean;
    printemps: boolean;
    automne: boolean;
}