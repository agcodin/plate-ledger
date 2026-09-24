/**
 * Reference nutrition table.
 *
 * Each row is [name, kcal, protein, carbohydrate, fiber, fat] per 100 g,
 * followed by household units as [label, grams]. Grams and ounces are
 * appended to every food by unitsFor().
 *
 * Indian and South Indian dishes are entered as they are normally cooked at
 * home — sambar with its usual tempering, dosa off a greased tawa, curries
 * with their oil. Restaurant versions run richer.
 */
export const RAW = [
  /* ---------- South Indian ---------- */
  ["idli", 130, 3.5, 25, 1.2, 0.4, [["idli", 45]]],
  ["dosa, plain", 168, 4, 28, 1.5, 4.5, [["dosa", 80]]],
  ["masala dosa", 180, 4, 27, 2.5, 6, [["dosa", 200]]],
  ["rava dosa", 220, 4.5, 28, 1.3, 10, [["dosa", 120]]],
  ["set dosa", 190, 4.5, 30, 1.5, 5.5, [["dosa", 60]]],
  ["neer dosa", 120, 2.5, 24, 1, 1.5, [["dosa", 50]]],
  ["ragi dosa", 150, 3.5, 26, 3, 3.5, [["dosa", 80]]],
  ["pesarattu", 160, 7, 22, 4, 4.5, [["pesarattu", 100]]],
  ["adai", 210, 9, 28, 4, 7, [["adai", 90]]],
  ["uttapam", 165, 4, 26, 2, 5, [["uttapam", 120]]],
  ["appam", 145, 2.8, 28, 1, 2.5, [["appam", 60]]],
  ["idiyappam", 145, 3, 31, 1.4, 0.5, [["serving", 80]]],
  ["puttu", 145, 3, 30, 1.8, 1.2, [["cylinder", 150]]],
  ["kerala parotta", 330, 6.5, 45, 1.8, 13, [["parotta", 80]]],
  ["akki roti", 200, 3.5, 32, 2, 6.5, [["roti", 70]]],
  ["medu vada", 280, 6, 30, 2.5, 15, [["vada", 45]]],
  ["masala vada", 300, 9, 32, 5, 14, [["vada", 40]]],
  ["dahi vada", 180, 5, 20, 2, 9, [["vada", 60]]],
  ["bonda", 290, 5, 32, 2, 16, [["bonda", 50]]],
  ["bajji", 280, 5, 30, 2.5, 15, [["bajji", 35]]],
  ["upma", 155, 3.5, 22, 1.8, 5.5, [["bowl", 250], ["cup", 200]]],
  ["ven pongal", 180, 5, 24, 1.5, 7, [["cup", 200]]],
  ["sweet pongal", 290, 4, 50, 1.5, 8, [["cup", 200]]],
  ["kesari bath", 320, 3.5, 45, 0.8, 14, [["serving", 100]]],
  ["bisi bele bath", 165, 5, 24, 2.5, 5, [["cup", 220]]],
  ["lemon rice", 180, 3, 28, 1.5, 6, [["cup", 180]]],
  ["curd rice", 120, 3.5, 17, 0.6, 3.5, [["cup", 200]]],
  ["tamarind rice", 190, 3.5, 29, 2, 6.5, [["cup", 180]]],
  ["coconut rice", 210, 3, 28, 2.5, 9.5, [["cup", 180]]],
  ["tomato rice", 175, 3.2, 27, 1.8, 6, [["cup", 180]]],
  ["sambar", 65, 3, 9, 2.5, 2, [["cup", 200], ["ladle", 100]]],
  ["rasam", 35, 1.2, 5, 1, 1.2, [["cup", 200]]],
  ["mor kuzhambu", 90, 3, 7, 1.5, 5.5, [["cup", 180]]],
  ["vatha kuzhambu", 110, 2.5, 12, 2.5, 6, [["cup", 150]]],
  ["coconut chutney", 180, 2.5, 7, 3.5, 16, [["tbsp", 15]]],
  ["tomato chutney", 90, 1.5, 9, 2, 5, [["tbsp", 15]]],
  ["peanut chutney", 230, 8, 10, 3, 18, [["tbsp", 15]]],
  ["idli podi", 480, 18, 35, 12, 28, [["tsp", 5]]],
  ["avial", 130, 2.5, 9, 3, 9, [["cup", 150]]],
  ["poriyal, green beans", 90, 2.5, 8, 3.5, 5.5, [["cup", 120]]],
  ["kootu", 100, 4, 12, 3.5, 4, [["cup", 150]]],
  ["thoran, cabbage", 85, 2, 8, 3, 5, [["cup", 120]]],
  ["sundal", 160, 7, 22, 6, 4.5, [["cup", 150]]],
  ["parippu curry", 110, 6, 14, 4, 3, [["cup", 180]]],
  ["vegetable kurma", 120, 3, 10, 2.5, 7.5, [["cup", 150]]],
  ["kerala vegetable stew", 120, 2.5, 9, 2, 8.5, [["cup", 200]]],
  ["chettinad chicken", 170, 18, 5, 1.5, 9, [["cup", 180]]],
  ["malabar fish curry", 120, 12, 4, 1, 6, [["cup", 180]]],
  ["fish moilee", 130, 12, 5, 1, 7, [["cup", 180]]],
  ["prawn curry", 140, 13, 5, 1, 7.5, [["cup", 180]]],
  ["chicken 65", 250, 20, 12, 1, 14, [["piece", 30]]],
  ["ragi mudde", 120, 2.5, 25, 2.8, 0.6, [["ball", 150]]],
  ["kozhukattai", 210, 3, 38, 1.5, 5.5, [["piece", 40]]],
  ["mysore pak", 550, 5, 55, 0.5, 35, [["piece", 30]]],
  ["payasam", 145, 3, 22, 0.4, 5, [["cup", 150]]],
  ["murukku", 520, 8, 55, 4, 29, [["piece", 20]]],
  ["banana chips", 520, 2, 58, 4, 31, [["handful", 30]]],
  ["filter coffee", 65, 1.8, 9, 0, 2.2, [["tumbler", 120]]],

  /* ---------- North and pan-Indian ---------- */
  ["chapati", 297, 9, 46, 6, 7, [["roti", 40]]],
  ["phulka", 260, 9, 50, 6, 2.5, [["phulka", 35]]],
  ["naan", 310, 9, 50, 2.2, 8, [["naan", 90]]],
  ["butter naan", 340, 8.5, 48, 2, 12, [["naan", 95]]],
  ["paratha, plain", 330, 7, 45, 4, 13, [["paratha", 70]]],
  ["aloo paratha", 280, 6, 38, 3.5, 11, [["paratha", 120]]],
  ["poori", 390, 7, 45, 3, 20, [["poori", 30]]],
  ["bhatura", 350, 8, 45, 2.5, 15, [["bhatura", 80]]],
  ["basmati rice, cooked", 130, 2.7, 28, 0.6, 0.3, [["cup", 158]]],
  ["jeera rice", 165, 3, 28, 0.8, 5, [["cup", 160]]],
  ["khichdi", 120, 5, 18, 2.5, 3, [["cup", 220]]],
  ["chicken biryani", 180, 10, 22, 1.2, 6, [["plate", 350], ["cup", 200]]],
  ["mutton biryani", 200, 11, 21, 1.2, 9, [["plate", 350]]],
  ["vegetable biryani", 165, 4, 25, 2.2, 5.5, [["plate", 350]]],
  ["butter chicken", 190, 14, 6, 1, 12, [["cup", 200]]],
  ["chicken curry", 165, 15, 5, 1.2, 9, [["cup", 200]]],
  ["chicken korma", 200, 13, 8, 1.5, 13, [["cup", 200]]],
  ["chicken tikka", 195, 25, 3, 0.5, 9, [["piece", 40]]],
  ["tandoori chicken", 175, 24, 2, 0.3, 8, [["leg", 150]]],
  ["mutton curry", 210, 17, 5, 1, 13, [["cup", 200]]],
  ["keema", 250, 18, 4, 0.8, 18, [["cup", 180]]],
  ["egg curry", 145, 9, 6, 1.2, 9.5, [["cup", 200]]],
  ["fish fry, indian", 220, 20, 6, 0.5, 13, [["piece", 80]]],
  ["paneer", 296, 18, 4, 0, 22, [["cube", 15]]],
  ["paneer tikka", 230, 16, 6, 1.5, 16, [["piece", 40]]],
  ["palak paneer", 165, 8, 6, 2.5, 12, [["cup", 200]]],
  ["paneer butter masala", 230, 9, 9, 1.5, 18, [["cup", 200]]],
  ["matar paneer", 190, 9, 10, 2.5, 13, [["cup", 200]]],
  ["paneer bhurji", 220, 14, 6, 1.5, 16, [["cup", 180]]],
  ["dal tadka", 120, 6, 14, 3.5, 4.5, [["cup", 200]]],
  ["dal makhani", 175, 7, 16, 5, 9, [["cup", 200]]],
  ["rajma", 130, 6, 17, 5, 4, [["cup", 200]]],
  ["chana masala", 150, 7, 18, 5.5, 5.5, [["cup", 200]]],
  ["aloo gobi", 110, 2.6, 13, 3.2, 5.5, [["cup", 180]]],
  ["aloo sabzi", 110, 2.2, 15, 2.2, 5, [["cup", 180]]],
  ["bhindi masala", 120, 2.2, 10, 3.8, 8, [["cup", 150]]],
  ["baingan bharta", 105, 2, 9, 3.5, 7, [["cup", 180]]],
  ["malai kofta", 260, 7, 16, 2.5, 19, [["cup", 200]]],
  ["gobi manchurian", 220, 4, 25, 2.5, 12, [["cup", 150]]],
  ["samosa", 310, 5, 32, 2.5, 18, [["samosa", 60]]],
  ["pakora", 320, 7, 30, 4, 19, [["piece", 25]]],
  ["dhokla", 160, 6, 24, 2, 4, [["piece", 40]]],
  ["poha", 180, 3, 28, 1.5, 6, [["cup", 180]]],
  ["sabudana khichdi", 230, 2, 40, 1.5, 7, [["cup", 180]]],
  ["vada pav", 290, 7, 40, 3, 11, [["one", 130]]],
  ["pav bhaji", 190, 4, 22, 3.5, 9.5, [["plate", 300]]],
  ["bhel puri", 290, 6, 40, 4, 11, [["cup", 100]]],
  ["pani puri", 330, 6, 45, 3, 14, [["puri", 15]]],
  ["papad", 370, 22, 45, 9, 9, [["papad", 12]]],
  ["mango pickle", 180, 1, 12, 2, 14, [["tsp", 8]]],
  ["raita", 70, 2.8, 5, 0.6, 4, [["cup", 150]]],
  ["curd, plain", 60, 3.1, 4.7, 0, 3.3, [["cup", 245]]],
  ["lassi, sweet", 105, 3, 15, 0, 3.5, [["glass", 250]]],
  ["mango lassi", 120, 2.8, 20, 0.4, 3, [["glass", 250]]],
  ["chaas", 35, 1.8, 3, 0, 1.5, [["glass", 240]]],
  ["masala chai", 70, 2, 9, 0, 3, [["cup", 150]]],
  ["gulab jamun", 350, 5, 45, 0.5, 16, [["piece", 40]]],
  ["jalebi", 400, 3, 60, 0.5, 17, [["piece", 25]]],
  ["rasgulla", 190, 4, 38, 0, 2.5, [["piece", 50]]],
  ["rasmalai", 210, 6, 26, 0, 9, [["piece", 60]]],
  ["barfi", 420, 7, 50, 1, 21, [["piece", 25]]],
  ["besan ladoo", 480, 9, 55, 3, 25, [["ladoo", 40]]],
  ["kaju katli", 480, 9, 52, 1.5, 26, [["piece", 15]]],
  ["gajar halwa", 280, 4, 35, 2, 14, [["cup", 150]]],
  ["sooji halwa", 350, 5, 48, 1.5, 16, [["cup", 150]]],
  ["kheer", 145, 3.5, 22, 0.3, 4.5, [["cup", 200]]],
  ["namkeen mixture", 540, 12, 48, 6, 33, [["cup", 40]]],
  ["momo, vegetable", 180, 5, 28, 2, 5, [["piece", 30]]],

  /* ---------- Indian staples and ingredients ---------- */
  ["toor dal, cooked", 120, 7, 20, 4, 0.4, [["cup", 200]]],
  ["moong dal, cooked", 105, 7, 19, 6, 0.4, [["cup", 200]]],
  ["urad dal, cooked", 120, 7.5, 20, 5, 0.5, [["cup", 200]]],
  ["chana dal, cooked", 130, 7, 21, 6, 2, [["cup", 200]]],
  ["besan", 387, 22, 58, 11, 7, [["cup", 92], ["tbsp", 9]]],
  ["ragi flour", 328, 7.3, 72, 11, 1.3, [["cup", 120]]],
  ["rava", 360, 12, 73, 3.5, 1, [["cup", 167]]],
  ["coconut, fresh grated", 354, 3.3, 15, 9, 33, [["cup", 80], ["tbsp", 6]]],
  ["coconut milk", 230, 2.3, 6, 2.2, 24, [["cup", 240]]],
  ["tamarind paste", 240, 2.8, 63, 5, 0.6, [["tbsp", 16]]],
  ["jaggery", 383, 0.4, 98, 0, 0.1, [["tbsp", 20]]],
  ["ghee", 900, 0, 0, 0, 100, [["tsp", 5], ["tbsp", 14]]],
  ["vegetable oil", 884, 0, 0, 0, 100, [["tsp", 4.5], ["tbsp", 13.5]]],

  /* ---------- meat, fish, eggs ---------- */
  ["chicken breast, cooked", 165, 31, 0, 0, 3.6, [["breast", 172]]],
  ["chicken thigh, cooked", 209, 26, 0, 0, 10.9, [["thigh", 90]]],
  ["chicken nuggets", 296, 15, 16, 1, 19, [["nugget", 16]]],
  ["ground beef, 85% lean, cooked", 250, 26, 0, 0, 15, [["patty", 85]]],
  ["steak, sirloin, cooked", 271, 27, 0, 0, 17, [["steak", 220]]],
  ["pork chop, cooked", 231, 26, 0, 0, 13, [["chop", 130]]],
  ["bacon, cooked", 541, 37, 1.4, 0, 42, [["slice", 10]]],
  ["turkey breast, deli", 104, 17, 4, 0, 2, [["slice", 28]]],
  ["ham, deli", 145, 17, 3, 0, 7, [["slice", 28]]],
  ["salmon, cooked", 208, 20, 0, 0, 13, [["fillet", 170]]],
  ["tuna, canned in water", 116, 26, 0, 0, 0.8, [["can", 142]]],
  ["shrimp, cooked", 99, 24, 0.2, 0, 0.3, [["shrimp", 6]]],
  ["cod, cooked", 105, 23, 0, 0, 0.9, [["fillet", 180]]],
  ["egg", 143, 13, 0.7, 0, 9.5, [["egg", 50]]],
  ["egg white", 52, 11, 0.7, 0, 0.2, [["white", 33]]],

  /* ---------- vegetarian protein ---------- */
  ["tofu, firm", 144, 15, 3, 2, 8, [["block", 350], ["cup, cubed", 252]]],
  ["tempeh", 192, 20, 8, 0, 11, [["cup", 166]]],
  ["lentils, cooked", 116, 9, 20, 8, 0.4, [["cup", 198]]],
  ["black beans, cooked", 132, 9, 24, 9, 0.5, [["cup", 172]]],
  ["chickpeas, cooked", 164, 9, 27, 8, 2.6, [["cup", 164]]],
  ["kidney beans, cooked", 127, 9, 23, 6, 0.5, [["cup", 177]]],
  ["edamame, shelled", 121, 12, 9, 5, 5, [["cup", 155]]],
  ["whey protein powder", 400, 80, 8, 2, 6, [["scoop", 30]]],
  ["protein bar", 380, 30, 40, 8, 12, [["bar", 60]]],

  /* ---------- dairy ---------- */
  ["greek yogurt, nonfat", 59, 10, 3.6, 0, 0.4, [["cup", 245], ["container", 170]]],
  ["greek yogurt, whole milk", 97, 9, 4, 0, 5, [["cup", 245], ["container", 170]]],
  ["yogurt, plain lowfat", 63, 5.3, 7, 0, 1.6, [["cup", 245]]],
  ["cottage cheese, 2%", 84, 11, 4.3, 0, 2.3, [["cup", 226]]],
  ["milk, whole", 61, 3.2, 4.8, 0, 3.3, [["cup", 244]]],
  ["milk, skim", 34, 3.4, 5, 0, 0.2, [["cup", 244]]],
  ["almond milk, unsweetened", 15, 0.6, 0.6, 0.3, 1.1, [["cup", 240]]],
  ["oat milk", 47, 1, 6.7, 0.8, 1.5, [["cup", 240]]],
  ["cheddar cheese", 403, 25, 1.3, 0, 33, [["slice", 28]]],
  ["mozzarella, part skim", 254, 24, 3, 0, 16, [["slice", 28]]],
  ["parmesan, grated", 431, 38, 4, 0, 29, [["tbsp", 5]]],
  ["cream cheese", 342, 6, 4, 0, 34, [["tbsp", 14]]],

  /* ---------- grains and breads ---------- */
  ["white rice, cooked", 130, 2.7, 28, 0.4, 0.3, [["cup", 158]]],
  ["brown rice, cooked", 123, 2.7, 26, 1.6, 1, [["cup", 195]]],
  ["quinoa, cooked", 120, 4.4, 21, 2.8, 1.9, [["cup", 185]]],
  ["oats, dry rolled", 379, 13, 67, 10, 6.5, [["cup", 80], ["half cup", 40]]],
  ["oatmeal, cooked", 71, 2.5, 12, 1.7, 1.5, [["cup", 234], ["bowl", 300]]],
  ["pasta, cooked", 158, 5.8, 31, 1.8, 0.9, [["cup", 140]]],
  ["whole wheat pasta, cooked", 124, 5.3, 27, 4.5, 0.5, [["cup", 140]]],
  ["couscous, cooked", 112, 3.8, 23, 1.4, 0.2, [["cup", 157]]],
  ["bread, white", 266, 9, 49, 2.7, 3.3, [["slice", 28]]],
  ["bread, whole wheat", 247, 13, 41, 7, 3.4, [["slice", 28]]],
  ["bagel", 250, 10, 49, 2, 1.5, [["bagel", 105]]],
  ["english muffin", 235, 8, 46, 4, 1.8, [["muffin", 57]]],
  ["tortilla, flour", 306, 8, 51, 3, 7.9, [["tortilla", 45]]],
  ["tortilla, corn", 218, 5.7, 45, 6, 2.9, [["tortilla", 26]]],
  ["potato, baked", 93, 2.5, 21, 2.2, 0.1, [["medium", 173]]],
  ["sweet potato, baked", 90, 2, 21, 3.3, 0.2, [["medium", 151]]],
  ["french fries", 312, 3.4, 41, 3.8, 15, [["small order", 117], ["medium order", 150]]],
  ["cereal, corn flakes", 357, 7, 84, 3, 0.4, [["cup", 28]]],
  ["granola", 471, 10, 64, 7, 20, [["cup", 122], ["half cup", 61]]],
  ["pancake", 227, 6, 28, 1, 10, [["pancake", 38]]],
  ["pizza, cheese", 266, 11, 33, 2.3, 10, [["slice", 107]]],
  ["crackers, saltine", 418, 9, 72, 3, 10, [["cracker", 3]]],

  /* ---------- vegetables ---------- */
  ["broccoli, cooked", 35, 2.4, 7, 3.3, 0.4, [["cup", 156]]],
  ["spinach, raw", 23, 2.9, 3.6, 2.2, 0.4, [["cup", 30], ["handful", 60]]],
  ["kale, raw", 49, 4.3, 9, 4, 0.9, [["cup", 21]]],
  ["carrot", 41, 0.9, 10, 2.8, 0.2, [["medium", 61]]],
  ["bell pepper", 31, 1, 6, 2.1, 0.3, [["medium", 119]]],
  ["tomato", 18, 0.9, 3.9, 1.2, 0.2, [["medium", 123]]],
  ["cucumber", 15, 0.7, 3.6, 0.5, 0.1, [["cup, sliced", 119]]],
  ["lettuce, romaine", 17, 1.2, 3.3, 2.1, 0.3, [["cup", 47]]],
  ["onion", 40, 1.1, 9.3, 1.7, 0.1, [["medium", 110]]],
  ["mushrooms", 22, 3.1, 3.3, 1, 0.3, [["cup", 70]]],
  ["green beans, cooked", 35, 1.9, 8, 3.4, 0.3, [["cup", 125]]],
  ["asparagus, cooked", 22, 2.4, 4, 2, 0.2, [["spear", 12]]],
  ["zucchini", 17, 1.2, 3.1, 1, 0.3, [["medium", 196]]],
  ["cauliflower", 25, 1.9, 5, 2, 0.3, [["cup", 107]]],
  ["okra, cooked", 36, 1.9, 7, 3.2, 0.3, [["cup", 160]]],
  ["bottle gourd, cooked", 15, 0.6, 3.4, 0.5, 0.1, [["cup", 150]]],
  ["drumstick, cooked", 37, 2.1, 8, 3.2, 0.2, [["stick", 50]]],
  ["corn, cooked", 96, 3.4, 21, 2.4, 1.5, [["cup", 164], ["ear", 90]]],
  ["peas, cooked", 84, 5.4, 16, 5.5, 0.2, [["cup", 160]]],
  ["avocado", 160, 2, 9, 7, 15, [["medium", 150], ["half", 75]]],

  /* ---------- fruit ---------- */
  ["apple", 52, 0.3, 14, 2.4, 0.2, [["medium", 182]]],
  ["banana", 89, 1.1, 23, 2.6, 0.3, [["medium", 118]]],
  ["orange", 47, 0.9, 12, 2.4, 0.1, [["medium", 131]]],
  ["strawberries", 32, 0.7, 7.7, 2, 0.3, [["cup", 152]]],
  ["blueberries", 57, 0.7, 14, 2.4, 0.3, [["cup", 148]]],
  ["raspberries", 52, 1.2, 12, 6.5, 0.7, [["cup", 123]]],
  ["grapes", 69, 0.7, 18, 0.9, 0.2, [["cup", 151]]],
  ["watermelon", 30, 0.6, 7.6, 0.4, 0.2, [["cup", 152]]],
  ["mango", 60, 0.8, 15, 1.6, 0.4, [["cup", 165], ["medium", 336]]],
  ["pineapple", 50, 0.5, 13, 1.4, 0.1, [["cup", 165]]],
  ["papaya", 43, 0.5, 11, 1.7, 0.3, [["cup", 145]]],
  ["guava", 68, 2.6, 14, 5.4, 1, [["medium", 55]]],
  ["peach", 39, 0.9, 10, 1.5, 0.3, [["medium", 150]]],
  ["pear", 57, 0.4, 15, 3.1, 0.1, [["medium", 178]]],
  ["pomegranate", 83, 1.7, 19, 4, 1.2, [["cup", 174]]],
  ["dates", 282, 2.5, 75, 8, 0.4, [["date", 24]]],
  ["raisins", 299, 3.1, 79, 3.7, 0.5, [["cup", 145], ["small box", 43]]],

  /* ---------- nuts, fats, condiments ---------- */
  ["almonds", 579, 21, 22, 12.5, 50, [["almond", 1.2], ["handful", 28]]],
  ["peanuts", 567, 26, 16, 8.5, 49, [["handful", 28]]],
  ["walnuts", 654, 15, 14, 6.7, 65, [["handful", 28]]],
  ["cashews", 553, 18, 30, 3.3, 44, [["handful", 28]]],
  ["pistachios", 560, 20, 28, 10, 45, [["handful", 28]]],
  ["peanut butter", 588, 25, 20, 6, 50, [["tbsp", 16]]],
  ["chia seeds", 486, 17, 42, 34, 31, [["tbsp", 12]]],
  ["olive oil", 884, 0, 0, 0, 100, [["tbsp", 13.5], ["tsp", 4.5]]],
  ["butter", 717, 0.9, 0.1, 0, 81, [["tbsp", 14], ["pat", 5]]],
  ["mayonnaise", 680, 1, 0.6, 0, 75, [["tbsp", 14]]],
  ["hummus", 166, 8, 14, 6, 9.6, [["tbsp", 15]]],
  ["ketchup", 101, 1, 25, 0.3, 0.1, [["tbsp", 17]]],

  /* ---------- sweets and drinks ---------- */
  ["dark chocolate, 70%", 598, 7.8, 46, 11, 43, [["square", 10]]],
  ["milk chocolate", 535, 7.6, 59, 3.4, 30, [["bar", 43]]],
  ["ice cream, vanilla", 207, 3.5, 24, 0.7, 11, [["cup", 132], ["scoop", 66]]],
  ["cookie, chocolate chip", 488, 5.7, 64, 2.4, 24, [["cookie", 16]]],
  ["donut, glazed", 452, 4.9, 51, 1.5, 25, [["donut", 60]]],
  ["honey", 304, 0.3, 82, 0.2, 0, [["tbsp", 21]]],
  ["sugar", 387, 0, 100, 0, 0, [["tsp", 4], ["tbsp", 12]]],
  ["orange juice", 45, 0.7, 10, 0.2, 0.2, [["cup", 248]]],
  ["soda, cola", 41, 0, 10.6, 0, 0, [["can", 368], ["bottle", 591]]],
  ["beer", 43, 0.5, 3.6, 0, 0, [["can", 356]]],
  ["wine, red", 85, 0.1, 2.6, 0, 0, [["glass", 147]]],
  ["coffee, black", 1, 0.1, 0, 0, 0, [["cup", 240]]],
  ["latte, whole milk", 56, 3, 5, 0, 2.5, [["small", 354], ["medium", 473]]],

  /* ---------- other prepared ---------- */
  ["burrito, bean and cheese", 206, 9, 28, 4, 6, [["burrito", 220]]],
  ["hamburger, fast food", 295, 17, 24, 1.5, 14, [["burger", 150]]],
  ["sandwich, turkey", 230, 13, 27, 2, 7, [["sandwich", 200]]],
  ["sushi roll, california", 93, 3, 19, 1, 1, [["roll", 170], ["piece", 28]]],
  ["ramen, instant", 448, 10, 63, 3, 17, [["pack", 85]]],
  ["caesar salad", 190, 5, 7, 2, 15, [["bowl", 200]]],
  ["mac and cheese", 164, 6.7, 20, 1, 6, [["cup", 227]]],
  ["soup, chicken noodle", 36, 2, 4.4, 0.4, 1.2, [["cup", 241]]],
  ["pad thai", 152, 6, 20, 1.5, 5, [["plate", 300]]],
  ["fried rice", 163, 5, 20, 1, 6, [["cup", 198]]],
  ["burrito bowl, chicken", 145, 10, 15, 3, 4, [["bowl", 500]]],
];

export const BASE_UNITS = [["g", 1], ["oz", 28.3495]];

/** Turn a raw row into a food object. `custom` marks user-added foods. */
export function mkFood(row, custom = false) {
  return {
    name: row[0],
    k: +row[1], p: +row[2], c: +row[3], f: +row[4], x: +row[5],
    s: row[6] || [],
    custom,
  };
}

/** Household units for a food, always followed by grams and ounces. */
export function unitsFor(food) {
  return [...(food.s || []), ...BASE_UNITS];
}

export const BUILT_IN = RAW.map((row) => mkFood(row, false));

/**
 * Rank foods against a typed query. Exact name beats prefix beats substring
 * beats all-words-present beats some-words-present; shorter names break ties.
 */
export function searchFoods(list, query, limit = 9) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const scored = [];
  for (const food of list) {
    const name = food.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else {
      const hits = words.filter((w) => name.includes(w)).length;
      if (hits === words.length) score = 40;
      else if (hits) score = 10 + hits * 5;
    }
    if (score) scored.push([score - name.length * 0.05, food]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, limit).map((pair) => pair[1]);
}
