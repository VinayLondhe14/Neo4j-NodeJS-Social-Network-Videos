CREATE (u1:User {name: "Bob", gender: "male", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-1.jpg"})
CREATE (u2:User {name: "Chris", gender: "male", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-2.jpg"})
CREATE (u3:User {name: "Christina", gender: "female", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-3.jpg"})
CREATE (u4:User {name: "Jessica", gender: "female", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-4.jpg"})
CREATE (u5:User {name: "Tom", gender: "male", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-5.jpg"})
CREATE (u6:User {name: "Karlie", gender: "female", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-6.jpg"})
CREATE (u7:User {name: "Kira", gender: "male", active: true, picture: "https://begin-imitate.codio.io:9500/images/avatar-7.jpg"})

CREATE (w1:Website {name: "Facebook"})
CREATE (w2:Website {name: "MySpace"})
CREATE (w3:Website {name: "Twitter"})
CREATE (w4:Website {name: "eBay"})
CREATE (w5:Website {name: "Google"})
CREATE (w6:Website {name: "YouTube"})
CREATE (w7:Website {name: "LinkedIn"})
CREATE (w8:Website {name: "Instagram"})

CREATE (u1)-[:follows]->(u2)
CREATE (u1)-[:follows]->(u3)
CREATE (u1)-[:follows]->(u4)
CREATE (u1)-[:like]->(w1)
CREATE (u1)-[:like]->(w3)
CREATE (u1)-[:like]->(w6)
CREATE (u1)-[:like]->(w8)

CREATE (u2)-[:follows]->(u4)
CREATE (u2)-[:like]->(w5)
CREATE (u2)-[:like]->(w6)

CREATE (u3)-[:follows]->(u6)
CREATE (u3)-[:like]->(w1)
CREATE (u3)-[:like]->(w2)
CREATE (u4)-[:like]->(w7)

CREATE (u4)-[:follows]->(u1)
CREATE (u4)-[:follows]->(u2)
CREATE (u4)-[:follows]->(u3)
CREATE (u4)-[:like]->(w1)
CREATE (u4)-[:like]->(w2)
CREATE (u4)-[:like]->(w3)

CREATE (u6)-[:like]->(w2)
CREATE (u6)-[:like]->(w4)
CREATE (u6)-[:like]->(w6)
CREATE (u6)-[:like]->(w7)

