Demo task

- Create run script for frontend- 
- Install and use gow to run go backend (instead of go)
- Install and run MinIO


The user should be able to take photos wiht his webcam on the front end. There should be a live preview. The photos are stored under a common group name that can be entered by text box, a photo is taken by clicking a button (sent to backend where they are stored in MinIO).

The frontend should have a list view of all groups including search function. By clicking a group all photos of this group should be shown in a preview with the possibility to download all group photos as a zip or show the full version of a photo by clicking.


- .gitignore missing items like "**/node_modules"
- Not using mux+gorm
- Frontend live updating?
- Omit Message Box on frontend
Welectron
4:21 PM
New Tasks:

- Load Settings from .env
- Database
- Menu Navigation
- Photo preview / single view
- Switch different cameras?
- Camera resolutions + Settings?
- Support network cameras (ONVIF)?

Backend: Go: mux, gorm+SQLite
Frontend: React: Material UI, AG-Grid
