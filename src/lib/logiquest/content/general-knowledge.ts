/** General Knowledge: static facts only (no current office-holders or other fast-changing data). */
import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const basic: RawQ[] = [
  m("Which is the largest ocean in the world?", ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], "The Pacific covers about a third of Earth's surface."),
  m("Which is the longest river in the world?", ["Nile", "Amazon", "Yangtze", "Mississippi"], "The Nile (about 6,650 km) is traditionally ranked longest; the Amazon is the largest by volume."),
  m("Which is the smallest continent by area?", ["Australia", "Europe", "Antarctica", "South America"], "Australia is both a continent and a country."),
  m("How many continents are there?", ["7", "5", "6", "8"], "Asia, Africa, North America, South America, Antarctica, Europe and Australia (Oceania)."),
  m("Which is the largest desert in the world (including polar deserts)?", ["Antarctic Desert", "Sahara", "Gobi", "Thar"], "Antarctica is a cold desert; the Sahara is the largest hot desert."),
  m("Which planet is known as the Red Planet?", ["Mars", "Venus", "Jupiter", "Mercury"], "Iron oxide on its surface gives Mars its red colour."),
  m("What is the national animal of India?", ["Tiger", "Lion", "Elephant", "Peacock"], "The Bengal tiger; the peacock is the national bird."),
  m("What is the national flower of India?", ["Lotus", "Rose", "Marigold", "Jasmine"], "The lotus symbolises purity."),
  m("Which is the highest mountain peak in the world?", ["Mount Everest", "K2", "Kangchenjunga", "Makalu"], "Everest is about 8,849 m above sea level."),
];

const history: RawQ[] = [
  m("The Battle of Plassey was fought in:", ["1757", "1857", "1764", "1761"], "Robert Clive defeated Siraj-ud-Daulah, beginning British dominance in Bengal."),
  m("Who founded the Maurya Empire?", ["Chandragupta Maurya", "Ashoka", "Bindusara", "Bimbisara"], "Chandragupta Maurya founded it around 322 BCE with Chanakya's help."),
  m("The Revolt of 1857 began at:", ["Meerut", "Delhi", "Kanpur", "Lucknow"], "Sepoys rose up at Meerut on 10 May 1857."),
  m("Who started the Dandi March (Salt Satyagraha) in 1930?", ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"], "Gandhi marched from Sabarmati to Dandi to break the salt law."),
  m("The Jallianwala Bagh massacre took place in:", ["1919", "1920", "1909", "1930"], "On 13 April 1919 in Amritsar, troops under General Dyer fired on a peaceful crowd."),
  m("Who was the first Governor-General of independent India?", ["Lord Mountbatten", "C. Rajagopalachari", "Lord Canning", "Warren Hastings"], "C. Rajagopalachari was the first (and last) Indian Governor-General."),
  m("The Indus Valley city of Harappa is located in present-day:", ["Pakistan", "India", "Afghanistan", "Iran"], "Harappa is in Punjab, Pakistan; Lothal and Dholavira are in India."),
  m("Who founded the Mughal Empire in India?", ["Babur", "Akbar", "Humayun", "Aurangzeb"], "Babur won the First Battle of Panipat in 1526."),
  m("The Quit India Movement was launched in:", ["1942", "1930", "1920", "1947"], "It began in August 1942 with the call 'Do or Die'."),
  m2("Who was known as the 'Iron Man of India'?", ["Sardar Vallabhbhai Patel", "Bal Gangadhar Tilak", "Lala Lajpat Rai", "Bhagat Singh"], "Patel integrated the princely states after independence."),
];

const geographyIndia: RawQ[] = [
  m("Which is the longest river in India?", ["Ganga", "Godavari", "Brahmaputra", "Yamuna"], "The Ganga is about 2,525 km long; the Godavari is the longest peninsular river."),
  m("Which is the largest state of India by area?", ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Uttar Pradesh"], "Rajasthan covers about 10.4% of India's area."),
  m("The Tropic of Cancer does NOT pass through which state?", ["Odisha", "Gujarat", "Madhya Pradesh", "West Bengal"], "It passes through Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram."),
  m("Which is the highest mountain peak located entirely in India?", ["Kangchenjunga", "Nanda Devi", "K2", "Mount Everest"], "Kangchenjunga (8,586 m) lies on the India–Nepal border; K2 is in territory administered by Pakistan."),
  m("The Western Ghats are also known as:", ["Sahyadri", "Aravalli", "Vindhya", "Satpura"], "The Sahyadri run parallel to India's western coast."),
  m("Which is the oldest mountain range in India?", ["Aravalli", "Himalaya", "Western Ghats", "Satpura"], "The Aravallis are among the oldest fold mountains in the world."),
  m("The Sundarbans delta is formed by which rivers?", ["Ganga and Brahmaputra", "Godavari and Krishna", "Narmada and Tapi", "Indus and Sutlej"], "It is the world's largest mangrove forest."),
  m("Which Indian state has the longest coastline?", ["Gujarat", "Tamil Nadu", "Andhra Pradesh", "Maharashtra"], "Gujarat's coastline is about 1,600 km."),
  m("Which river is known as the 'Sorrow of Bihar'?", ["Kosi", "Gandak", "Son", "Damodar"], "The Kosi changes its course and causes floods; the Damodar was called the 'Sorrow of Bengal'."),
];

const polity: RawQ[] = [
  m("The Constitution of India came into force on:", ["26 January 1950", "15 August 1947", "26 November 1949", "30 January 1948"], "It was adopted on 26 November 1949 and came into force on 26 January 1950 (Republic Day)."),
  m("Who was the chairman of the Drafting Committee of the Constitution?", ["B. R. Ambedkar", "Rajendra Prasad", "Jawaharlal Nehru", "Sardar Patel"], "Rajendra Prasad was President of the Constituent Assembly."),
  m("How many Fundamental Rights does the Indian Constitution now guarantee?", ["6", "7", "5", "8"], "The Right to Property was removed as a fundamental right by the 44th Amendment (1978)."),
  m("Which article deals with the Right to Constitutional Remedies?", ["Article 32", "Article 21", "Article 19", "Article 370"], "Ambedkar called it the 'heart and soul' of the Constitution."),
  m("The maximum strength of the Lok Sabha as per the Constitution is:", ["552", "545", "250", "500"], "Article 81 allows up to 552 members."),
  m("Who is the Supreme Commander of the Indian Armed Forces?", ["The President", "The Prime Minister", "The Defence Minister", "The Chief of Defence Staff"], "Article 53 vests supreme command in the President."),
  m("The minimum age to become a member of the Lok Sabha is:", ["25 years", "30 years", "21 years", "35 years"], "Rajya Sabha requires 30; the President must be 35."),
  m("Fundamental Duties were added by which amendment?", ["42nd Amendment", "44th Amendment", "73rd Amendment", "1st Amendment"], "The 42nd Amendment (1976) added Article 51A."),
  m("Panchayati Raj was given constitutional status by the:", ["73rd Amendment", "74th Amendment", "42nd Amendment", "61st Amendment"], "The 74th Amendment covers urban local bodies."),
];

const economy: RawQ[] = [
  m("Which institution is India's central bank?", ["Reserve Bank of India", "State Bank of India", "NITI Aayog", "SEBI"], "The RBI was established on 1 April 1935."),
  m("GST was introduced in India on:", ["1 July 2017", "1 April 2016", "8 November 2016", "1 January 2018"], "It replaced many indirect taxes with one tax."),
  m("Which body regulates securities markets in India?", ["SEBI", "RBI", "IRDAI", "NABARD"], "The Securities and Exchange Board of India."),
  m("The repo rate is the rate at which:", ["The RBI lends to commercial banks", "Banks lend to the public", "Banks lend to the RBI", "The government borrows abroad"], "Reverse repo is the rate at which the RBI borrows from banks."),
  m("Which organisation replaced the Planning Commission in 2015?", ["NITI Aayog", "Finance Commission", "RBI", "CAG"], "NITI Aayog is a policy think tank."),
  m("Inflation means:", ["A general rise in the price level", "A fall in prices", "An increase in exports", "A rise in unemployment only"], "Deflation is a general fall in prices."),
  m("GDP measures:", ["The total value of final goods and services produced within a country in a period", "Government income", "Total exports", "Foreign reserves"], "Gross Domestic Product."),
  m("NABARD is related to financing of:", ["Agriculture and rural development", "Housing", "Foreign trade", "Stock markets"], "National Bank for Agriculture and Rural Development."),
];

const culture: RawQ[] = [
  m("Bharatanatyam is a classical dance of:", ["Tamil Nadu", "Kerala", "Odisha", "Andhra Pradesh"], "Kathakali and Mohiniyattam are from Kerala; Odissi from Odisha; Kuchipudi from Andhra Pradesh."),
  m("Kathak is a classical dance from:", ["North India (Uttar Pradesh)", "Kerala", "Manipur", "Tamil Nadu"], "Manipuri is from Manipur."),
  m("Pongal is mainly celebrated in:", ["Tamil Nadu", "Punjab", "Assam", "Gujarat"], "It is a harvest festival; Bihu is Assam's harvest festival."),
  m("The Sun Temple at Konark is in:", ["Odisha", "Gujarat", "Madhya Pradesh", "Rajasthan"], "It was built in the 13th century."),
  m("Who composed India's national anthem, 'Jana Gana Mana'?", ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Muhammad Iqbal", "Sarojini Naidu"], "Bankim Chandra wrote 'Vande Mataram', the national song."),
  m("The Ajanta and Ellora caves are in:", ["Maharashtra", "Madhya Pradesh", "Karnataka", "Andhra Pradesh"], "They are UNESCO World Heritage Sites."),
  m("Carnatic music is a classical music tradition of:", ["South India", "North India", "North-East India", "Western India"], "Hindustani music is the North Indian tradition."),
  m("Hampi, a UNESCO World Heritage Site, was the capital of the:", ["Vijayanagara Empire", "Maurya Empire", "Chola Empire", "Mughal Empire"], "Hampi is in Karnataka."),
];

const worldGeography: RawQ[] = [
  m("Which is the largest country in the world by area?", ["Russia", "Canada", "China", "USA"], "Russia covers about 17 million km²."),
  m("The Sahara Desert is in:", ["Africa", "Asia", "Australia", "South America"], "It is the largest hot desert."),
  m("Which strait separates Asia from North America?", ["Bering Strait", "Strait of Gibraltar", "Palk Strait", "Strait of Malacca"], "Palk Strait separates India and Sri Lanka."),
  m("The Great Barrier Reef is located off the coast of:", ["Australia", "Brazil", "South Africa", "Indonesia"], "It is the world's largest coral reef system."),
  m("Which is the deepest point in the world's oceans?", ["Challenger Deep (Mariana Trench)", "Java Trench", "Puerto Rico Trench", "Tonga Trench"], "It is nearly 11 km deep in the Pacific."),
  m("Which country has the most time zones (including overseas territories)?", ["France", "Russia", "USA", "China"], "France has 12 time zones because of its overseas territories."),
  m("The Andes mountain range is in:", ["South America", "Europe", "Africa", "Asia"], "It is the longest continental mountain range."),
  m("Which line divides the Earth into Northern and Southern Hemispheres?", ["Equator", "Prime Meridian", "Tropic of Cancer", "International Date Line"], "The Prime Meridian divides East and West."),
];

const organisations: RawQ[] = [
  m("Where is the headquarters of the United Nations?", ["New York", "Geneva", "Paris", "Washington, D.C."], "Geneva hosts the UN's European office."),
  m("WHO is headquartered in:", ["Geneva", "New York", "Paris", "Rome"], "The World Health Organization was founded in 1948."),
  m("UNESCO's headquarters is in:", ["Paris", "Rome", "New York", "London"], "UNESCO works in education, science and culture."),
  m("How many permanent members does the UN Security Council have?", ["5", "10", "15", "7"], "China, France, Russia, the UK and the USA."),
  m("The International Monetary Fund (IMF) is headquartered in:", ["Washington, D.C.", "New York", "Geneva", "Brussels"], "The World Bank is also headquartered in Washington, D.C."),
  m("SAARC is an organisation of countries in:", ["South Asia", "South-East Asia", "Africa", "Europe"], "Founded in 1985 in Dhaka."),
  m("The World Trade Organization (WTO) is headquartered in:", ["Geneva", "Vienna", "New York", "Brussels"], "It replaced GATT in 1995."),
  m("Which organisation's main role is maintaining international peace and security?", ["United Nations", "WTO", "IMF", "OPEC"], "The UN was founded in 1945."),
];

const inventions: RawQ[] = [
  m("Who invented the telephone?", ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"], "Bell received the patent in 1876."),
  m("Who discovered penicillin?", ["Alexander Fleming", "Louis Pasteur", "Robert Koch", "Edward Jenner"], "Fleming discovered it in 1928."),
  m("The World Wide Web was invented by:", ["Tim Berners-Lee", "Vint Cerf", "Bill Gates", "Steve Jobs"], "He proposed it at CERN in 1989."),
  m("Who developed the theory of relativity?", ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Galileo Galilei"], "Special relativity 1905, general relativity 1915."),
  m("Who invented the light bulb that became commercially successful?", ["Thomas Edison", "Joseph Swan", "Benjamin Franklin", "James Watt"], "Edison's practical incandescent lamp (1879); Swan worked on similar lamps in the UK."),
  m("Who is credited with inventing the radio?", ["Guglielmo Marconi", "J. C. Bose", "Alexander Bell", "Michael Faraday"], "Marconi is credited for practical radio; J. C. Bose did pioneering microwave research."),
  m("Who discovered the vaccine for smallpox?", ["Edward Jenner", "Louis Pasteur", "Jonas Salk", "Robert Koch"], "Jenner developed it in 1796; Salk developed the polio vaccine."),
  m("The steam engine was greatly improved by:", ["James Watt", "Thomas Newcomen only", "George Stephenson", "Isaac Newton"], "Watt's separate condenser made steam engines efficient."),
];

const personalities: RawQ[] = [
  m("Who is known as the 'Missile Man of India'?", ["Dr. A. P. J. Abdul Kalam", "Vikram Sarabhai", "Homi Bhabha", "C. V. Raman"], "Kalam led India's missile development programmes and later became President."),
  m("Who is regarded as the father of the Indian space programme?", ["Vikram Sarabhai", "Homi Bhabha", "Satish Dhawan", "A. P. J. Abdul Kalam"], "Sarabhai founded ISRO's predecessor INCOSPAR."),
  m("Who was the first Indian to win a Nobel Prize?", ["Rabindranath Tagore", "C. V. Raman", "Mother Teresa", "Amartya Sen"], "Tagore won the Literature prize in 1913."),
  m("C. V. Raman won the Nobel Prize in Physics for the discovery of:", ["The Raman effect (scattering of light)", "Radioactivity", "X-rays", "Superconductivity"], "He won it in 1930."),
  m("Who was the first woman Prime Minister of India?", ["Indira Gandhi", "Sarojini Naidu", "Pratibha Patil", "Sucheta Kripalani"], "Indira Gandhi first became PM in 1966."),
  m("Who was the first Indian woman to go into space?", ["Kalpana Chawla", "Sunita Williams", "Tessy Thomas", "Bachendri Pal"], "Kalpana Chawla flew on the Space Shuttle Columbia in 1997."),
  m("Who founded the Indian National Congress in 1885?", ["A. O. Hume", "Dadabhai Naoroji", "Mahatma Gandhi", "Bal Gangadhar Tilak"], "Allan Octavian Hume was a retired British civil servant."),
  m("Srinivasa Ramanujan is famous for his work in:", ["Mathematics", "Physics", "Chemistry", "Literature"], "His birthday, 22 December, is India's National Mathematics Day."),
];

const books: RawQ[] = [
  m("Who wrote 'Discovery of India'?", ["Jawaharlal Nehru", "Mahatma Gandhi", "B. R. Ambedkar", "Rabindranath Tagore"], "Written in Ahmednagar Fort prison (1942–46)."),
  m("'Gitanjali' was written by:", ["Rabindranath Tagore", "Sarojini Naidu", "Premchand", "R. K. Narayan"], "It won the 1913 Nobel Prize in Literature."),
  m("'Wings of Fire' is the autobiography of:", ["A. P. J. Abdul Kalam", "Narendra Modi", "Ratan Tata", "Sachin Tendulkar"], "Co-written with Arun Tiwari."),
  m("Who wrote 'The Story of My Experiments with Truth'?", ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Vinoba Bhave"], "Gandhi's autobiography, written in Gujarati."),
  m("'Arthashastra' was written by:", ["Kautilya (Chanakya)", "Kalidasa", "Banabhatta", "Valmiki"], "An ancient treatise on statecraft and economics."),
  m("Who wrote 'Romeo and Juliet'?", ["William Shakespeare", "Charles Dickens", "Jane Austen", "Leo Tolstoy"], "Written in the 1590s."),
  m("'War and Peace' was written by:", ["Leo Tolstoy", "Fyodor Dostoevsky", "Anton Chekhov", "Victor Hugo"], "Published in 1869."),
  m("'Malgudi Days' was written by:", ["R. K. Narayan", "Ruskin Bond", "Mulk Raj Anand", "Vikram Seth"], "Set in the fictional town of Malgudi."),
];

const sports: RawQ[] = [
  m("How many players are there in a cricket team on the field?", ["11", "10", "12", "9"], "Each side fields 11 players."),
  m("The term 'checkmate' is used in:", ["Chess", "Carrom", "Bridge", "Golf"], "Checkmate ends a chess game."),
  m("How long is a standard Olympic swimming pool?", ["50 metres", "25 metres", "100 metres", "75 metres"], "Long-course pools are 50 m."),
  m("The Ranji Trophy is associated with:", ["Cricket", "Football", "Hockey", "Tennis"], "India's premier first-class cricket competition."),
  m("Which country hosted the first modern Olympic Games in 1896?", ["Greece", "France", "USA", "Italy"], "They were held in Athens."),
  m("The Durand Cup is associated with:", ["Football", "Cricket", "Hockey", "Badminton"], "It is one of the oldest football tournaments in the world."),
  m("How many players does a football (soccer) team have on the field?", ["11", "10", "9", "12"], "Including the goalkeeper."),
  m("The term 'love' (meaning zero) is used in:", ["Tennis", "Cricket", "Hockey", "Golf"], "e.g. 'fifteen–love'."),
  m("Major Dhyan Chand is a legend of which sport?", ["Hockey", "Cricket", "Football", "Wrestling"], "India's National Sports Day (29 August) marks his birthday."),
];

const awards: RawQ[] = [
  m("Which is India's highest civilian award?", ["Bharat Ratna", "Padma Vibhushan", "Padma Bhushan", "Param Vir Chakra"], "Order: Bharat Ratna, Padma Vibhushan, Padma Bhushan, Padma Shri."),
  m("Which is India's highest gallantry award in wartime?", ["Param Vir Chakra", "Ashoka Chakra", "Vir Chakra", "Kirti Chakra"], "The Ashoka Chakra is the highest peacetime gallantry award."),
  m("The Dadasaheb Phalke Award is given for contribution to:", ["Indian cinema", "Literature", "Sports", "Science"], "It is India's highest film honour."),
  m("The Jnanpith Award is given for:", ["Literature", "Music", "Sports", "Journalism"], "It honours outstanding Indian literature."),
  m("The Pulitzer Prize is mainly associated with:", ["Journalism and literature", "Physics", "Peace", "Sports"], "Awarded in the USA."),
  m("Which award is given for excellence in sports coaching in India?", ["Dronacharya Award", "Arjuna Award", "Khel Ratna", "Dhyan Chand Award"], "Arjuna Awards honour sportspersons; the Major Dhyan Chand Khel Ratna is the highest sports honour."),
  m("The Nobel Prize is NOT awarded in which field?", ["Mathematics", "Physics", "Literature", "Peace"], "Mathematics has prizes such as the Fields Medal and the Abel Prize."),
  m("The Booker Prize is awarded for:", ["Fiction written in English", "Science", "Peace", "Music"], "It honours a novel published in the UK or Ireland."),
];

const days: RawQ[] = [
  m("National Science Day in India is observed on:", ["28 February", "5 September", "14 November", "11 May"], "It marks C. V. Raman's discovery of the Raman effect (1928)."),
  m("Teachers' Day in India is celebrated on:", ["5 September", "14 November", "2 October", "15 August"], "Birthday of Dr. Sarvepalli Radhakrishnan."),
  m("World Environment Day is observed on:", ["5 June", "22 April", "1 May", "16 September"], "Earth Day is 22 April."),
  m("National Youth Day in India (Swami Vivekananda's birthday) is on:", ["12 January", "23 January", "26 January", "30 January"], "Vivekananda was born on 12 January 1863."),
  m("World Health Day is observed on:", ["7 April", "1 December", "31 May", "10 October"], "It marks the founding of the WHO in 1948."),
  m("Children's Day in India is celebrated on:", ["14 November", "5 September", "2 October", "26 January"], "Birthday of Jawaharlal Nehru."),
  m("National Technology Day in India is on:", ["11 May", "28 February", "1 July", "15 September"], "It marks the Pokhran-II nuclear tests (1998)."),
  m("International Yoga Day is observed on:", ["21 June", "21 March", "1 January", "15 August"], "Declared by the UN in 2014."),
];

const firsts: RawQ[] = [
  m("Who was the first President of India?", ["Dr. Rajendra Prasad", "Dr. S. Radhakrishnan", "Zakir Husain", "V. V. Giri"], "He served from 1950 to 1962."),
  m("Who was the first Prime Minister of India?", ["Jawaharlal Nehru", "Lal Bahadur Shastri", "Sardar Patel", "Morarji Desai"], "From 1947 to 1964."),
  m("Who was the first Indian woman to climb Mount Everest?", ["Bachendri Pal", "Arunima Sinha", "Santosh Yadav", "Premlata Agarwal"], "She reached the summit in 1984."),
  m("India's first satellite was:", ["Aryabhata", "Bhaskara", "Rohini", "INSAT-1A"], "Launched in 1975 by the Soviet Union."),
  m("Who was the first Indian to travel into space?", ["Rakesh Sharma", "Kalpana Chawla", "Sunita Williams", "Ravish Malhotra"], "He flew on Soyuz T-11 in 1984."),
  m("The first railway line in India ran between:", ["Bombay and Thane", "Delhi and Agra", "Madras and Arcot", "Calcutta and Howrah"], "It opened on 16 April 1853."),
  m("Who was the first woman Governor of an Indian state?", ["Sarojini Naidu", "Sucheta Kripalani", "Indira Gandhi", "Vijaya Lakshmi Pandit"], "She became Governor of the United Provinces in 1947."),
  m("Who was the first Indian to win an individual Olympic gold medal?", ["Abhinav Bindra", "Neeraj Chopra", "Leander Paes", "Milkha Singh"], "Bindra won in 10 m air rifle at Beijing 2008."),
];

const places: RawQ[] = [
  m("The Taj Mahal is located in:", ["Agra", "Delhi", "Jaipur", "Lucknow"], "Built by Shah Jahan in memory of Mumtaz Mahal."),
  m("The Golden Temple is in:", ["Amritsar", "Delhi", "Chandigarh", "Patiala"], "Sri Harmandir Sahib, the holiest Sikh shrine."),
  m("Gateway of India is located in:", ["Mumbai", "Delhi", "Kolkata", "Chennai"], "Built to commemorate the 1911 royal visit."),
  m("The Charminar is in:", ["Hyderabad", "Bengaluru", "Chennai", "Bhopal"], "Built in 1591 by Muhammad Quli Qutb Shah."),
  m("The Qutub Minar is in:", ["Delhi", "Agra", "Jaipur", "Lucknow"], "A UNESCO World Heritage Site."),
  m("Meenakshi Amman Temple is located in:", ["Madurai", "Thanjavur", "Kanchipuram", "Rameswaram"], "Famous for its towering gopurams."),
  m("Victoria Memorial is in:", ["Kolkata", "Mumbai", "Chennai", "Delhi"], "Built in memory of Queen Victoria."),
  m("Kaziranga National Park, famous for the one-horned rhinoceros, is in:", ["Assam", "West Bengal", "Kerala", "Madhya Pradesh"], "A UNESCO World Heritage Site."),
];

const subject: RawSubject = {
  "basic-general-knowledge": topic(basic, { intro: "Basic general knowledge covers facts about the world and India that appear in almost every competitive exam." }),
  "indian-history": topic(history, { intro: "Indian history spans ancient (Indus Valley, Mauryas, Guptas), medieval (Delhi Sultanate, Mughals, Vijayanagara) and modern periods (British rule and the freedom struggle)." }),
  "indian-geography": topic(geographyIndia, { intro: "India's physical geography includes the Himalayas, the northern plains, the peninsular plateau, the coastal plains, deserts and islands, with major river systems." }),
  "indian-politics": topic(polity, { intro: "Indian polity covers the Constitution, fundamental rights and duties, the Union and State governments, Parliament, the judiciary and local government." }),
  "indian-economy": topic(economy, { intro: "Key institutions (RBI, SEBI, NITI Aayog), concepts (GDP, inflation, repo rate) and reforms (GST) form the basics of the Indian economy." }),
  "indian-culture": topic(culture, { intro: "India's culture includes classical dances, music traditions, festivals, monuments and heritage sites." }),
  "world-geography": topic(worldGeography, { intro: "World geography covers continents, oceans, mountains, deserts, rivers, straits and important lines of latitude and longitude." }),
  "world-organisations": topic(organisations, { intro: "International organisations such as the UN and its agencies, IMF, World Bank, WTO and regional groups shape global cooperation." }),
  inventions: topic(inventions, { intro: "Important inventions and discoveries with their inventors appear frequently in exams." }),
  "famous-personalities": topic(personalities, { intro: "Notable Indians in science, politics, literature and space." }),
  "books-and-authors": topic(books, { intro: "Famous books and their authors, Indian and international." }),
  sports: topic(sports, { intro: "Sports facts: team sizes, terms, trophies and famous sportspersons." }),
  "awards-and-honours": topic(awards, { intro: "National and international awards and the fields they honour." }),
  "days-and-dates": topic(days, { intro: "National and international days and why they are observed." }),
  "first-in-india": topic(firsts, { intro: "Notable 'firsts' in Indian history, science, sports and public life." }),
  "famous-places-in-india": topic(places, { intro: "Famous monuments, temples and national parks and where they are." }),
};
export default subject;
