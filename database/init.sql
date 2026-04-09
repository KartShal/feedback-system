CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255)
);

CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER REFERENCES managers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO managers (name, photo_url) VALUES 
('Алексей Смирнов', 'https://i.pravatar.cc/150?img=11'),
('Елена Иванова', 'https://i.pravatar.cc/150?img=5');
