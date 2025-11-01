from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.Task import Task
from app.models.schemas import TaskSchema
import traceback

tasks_bp = Blueprint('tasks_bp', __name__)
task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

@tasks_bp.route('/tasks')
@login_required
def get_tasks():
    try:
        tasks = Task.query.filter_by(owner_id=current_user.user_id).all()
        if not tasks:
            return jsonify({
            "success" : False,
            "error" : 'Tasks not Found',
        })
        return jsonify({
            "success" : True,
            "tasks" : tasks_schema.dump(tasks),
        }), 200
    except Exception as e:
        print(e)
        return jsonify({
            "success" : False,
            "error": "Unable to fetch tasks",
        }), 500

@tasks_bp.route('/create-task', methods=['POST'])
@login_required
def create_task():
    try:
        data = request.get_json()
        task = data.get('task')
        if not task:
            return jsonify({'success' : False, 'error' : 'No task data'}), 404
        new_task = Task(task=task, owner_id=current_user.user_id)
        db.session.add(new_task)
        db.session.commit()
        return jsonify({
            'success': True,
            'task': task_schema.dump(new_task)
        }), 201
    except Exception as e:
        print(e)
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    try:    
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'success': False, 'error': 'Task not found'}), 404
        
        if task.owner_id != current_user.user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        data = request.get_json()
        task.task = data.get('task', task.task)
        db.session.commit()

        return jsonify({'success': True, 'task': task_schema.dump(task)}), 200
    except Exception as e:
        print(e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500
    
@tasks_bp.route('/tasks/status/<task_id>', methods=['PUT'])
@login_required
def status_change(task_id):
    try:
        task = Task.query.get(task_id)

        if not task:
            return jsonify({'success': False, 'error': 'Task not found'}), 404
        
        if task.owner_id != current_user.user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        task.status = not task.status
        db.session.commit()

        return jsonify({'success': True, 'task': task_schema.dump(task)}), 200

    except Exception as e:
        print(e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'success': False, 'error': 'Task not found'}), 404

        if task.owner_id != current_user.user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        db.session.delete(task)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Note deleted'}), 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500