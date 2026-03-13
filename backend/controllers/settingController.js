const Setting = require("../models/settingModel");
const { z } = require("zod");

const logError = (method, error) => {
	console.error(`--- BŁĄD W SETTING:${method} ---`);
	console.error(error);
	console.error("--------------------------");
};

// Walidacja danych przychodzących z frontendu
const shippingCostsSchema = z.object({
	courierCost: z.coerce.number().min(0, "Koszt kuriera nie może być ujemny."),
	lockerCost: z.coerce.number().min(0, "Koszt paczkomatu nie może być ujemny."),
});

exports.getShippingCosts = async (req, res, next) => {
	try {
		const settings = await Setting.getAll();

		// Konwersja tablicy z bazy na jeden obiekt przyjazny dla front-endu
		const costs = {
			courierCost: "0.00",
			lockerCost: "0.00",
		};

		settings.forEach((setting) => {
			if (setting.setting_key === "courier_cost")
				costs.courierCost = setting.setting_value;
			if (setting.setting_key === "locker_cost")
				costs.lockerCost = setting.setting_value;
		});

		res.json(costs);
	} catch (error) {
		logError("getShippingCosts", error);
		next(error);
	}
};

exports.updateShippingCosts = async (req, res, next) => {
	try {
		// Walidacja za pomocą Zod
		const parsed = shippingCostsSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.errors[0].message });
		}

		// Konwersja z powrotem na format zrozumiały dla bazy danych
		const settingsToSave = [
			{ key: "courier_cost", value: parsed.data.courierCost.toString() },
			{ key: "locker_cost", value: parsed.data.lockerCost.toString() },
		];

		await Setting.saveMultiple(settingsToSave);

		res.json({
			success: true,
			message: "Koszty wysyłki zostały pomyślnie zaktualizowane.",
		});
	} catch (error) {
		logError("updateShippingCosts", error);
		next(error);
	}
};
