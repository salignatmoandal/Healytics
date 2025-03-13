import type { Context } from "hono";
import { SymptomService } from "../services/symptomService";

export class SymptomController {
  // Crée un enregistrement de symptômes pour l'utilisateur authentifié
  static async create(c: Context) {
    try {
      // Récupère les informations de l'utilisateur (définies par le middleware d'authentification)
      const user = c.get("user");
      if (!user || !user.userId) {
        return c.json({ error: "Utilisateur non authentifié" }, 401);
      }
      
      // Extrait les détails des symptômes depuis le corps de la requête
      const { details } = await c.req.json();
      if (!details) {
        return c.json({ error: "Les détails des symptômes sont requis" }, 400);
      }
      
      // Appelle le service pour créer un enregistrement lié à l'utilisateur
      const symptom = await SymptomService.create(user.userId, details);
      return c.json({ symptom });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }

  // Récupère tous les enregistrements de symptômes pour l'utilisateur authentifié
  static async getAll(c: Context) {
    try {
      const user = c.get("user");
      if (!user || !user.userId) {
        return c.json({ error: "Utilisateur non authentifié" }, 401);
      }
      
      // Appelle le service pour récupérer tous les symptômes de l'utilisateur
      const symptoms = await SymptomService.getAll(user.userId);
      return c.json({ symptoms });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
}