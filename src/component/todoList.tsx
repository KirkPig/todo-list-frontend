import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.js";
import { Trash } from "react-bootstrap-icons";

export interface TodoListProps {}

type Todos = {
	key: string;
	name: string;
	complete: boolean;
};

export interface TodoListState {
	todoList: Todos[];
	newTodoText: string;
}

class TodoList extends React.Component<TodoListProps, TodoListState> {
	constructor(props: TodoListProps) {
		super(props);
		this.state = {
			todoList: [],
			newTodoText: "",
		};
	}

	componentDidMount() {
		this.refreshList();
	}

	componentDidUpdate() {
		this.state.todoList.map((data) => {
			axios.put(
				"http://localhost:8000/api/todos/" + data.key,
				data
			).catch((err) => console.log(err));
			return console.log(data.key + " Done");
		});
	}

	refreshList() {
		axios.get<Todos[]>("http://localhost:8000/api/todos")
			.then((res) => {
				this.setState({ todoList: res.data });
			})
			.catch((err) => console.log(err));
	}

	render() {
		return (
			<div className='container'>
				<div className='row p-3'>
					<h1>Todo List</h1>
				</div>
				<div className='row m-2'>
					<div className='col-10'></div>
					<button
						type='button'
						className='col-2 btn btn-primary'
						data-bs-toggle='modal'
						data-bs-target='#todoModal'>
						Add
					</button>
					<div className='row' id='todo-list'>
						{this.renderTodoList()}
					</div>

					{this.newTodoModal()}
				</div>
			</div>
		);
	}

	private newTodoModal() {
		return (
			<div
				className='modal fade'
				id='todoModal'
				aria-labelledby='todoModalLabel'
				aria-hidden='true'>
				<div className='modal-dialog'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5
								className='modal-title'
								id='todoModalLabel'>
								New Todo
							</h5>
							<button
								type='button'
								className='btn-close'
								data-bs-dismiss='modal'
								aria-label='Close'></button>
						</div>
						<div className='modal-body'>
							{this.newTodoForm()}
						</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-secondary'
								data-bs-dismiss='modal'>
								Cancel
							</button>
							<button
								type='button'
								className='btn btn-primary'
								onClick={(event) => {
									this.addTodo();
								}}
								data-bs-dismiss='modal'>
								Save
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
	private newTodoForm() {
		return (
			<form id='new-todo-form' onSubmit={() => this.addTodo()}>
				<input
					type='text'
					className='form-control'
					id='todoName'
					placeholder='Enter Todos Description'
					onChange={(event) => {
						this.setState({
							newTodoText: event.target.value,
						});
					}}></input>
			</form>
		);
	}

	private deleteTodo(key: String) {
		axios.delete("http://localhost:8000/api/todos/" + key)
			.then(() => {
				this.refreshList();
			})
			.catch((err) => {
				console.log(err);
			});
	}

	private updateTodo(keyUpdate: String, value: boolean) {
		let newTodoList: Todos[] = new Array();

		this.state.todoList.map((data) => {
			if (data.key === keyUpdate) {
				let todo: Todos = data;

				todo.complete = value;
				newTodoList.push(todo);
			} else {
				newTodoList.push(data);
			}

			return "Done";
		});

		this.setState({
			todoList: newTodoList,
		});
	}

	private hashKey(str: string) {
		var hash = 0,
			i,
			chr;
		for (i = 0; i < str.length; i++) {
			chr = str.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	private addTodo() {
		let todo: Todos = {
			key: this.hashKey(this.state.newTodoText).toString(),
			name: this.state.newTodoText,
			complete: false,
		};

		axios.post("http://localhost:8000/api/todos", todo)
			.then(() => {
				let formID = "new-todo-form";
				let resetForm: HTMLFormElement;
				resetForm = document.getElementById(
					formID
				) as HTMLFormElement;
				resetForm.reset();

				this.refreshList();
			})
			.catch((err) => {
				console.log(err);
			});
	}

	private renderLabelDone(key: String, complete: boolean) {
		if (complete) {
			return (
				<div className='form-check form-switch'>
					<input
						className='form-check-input'
						type='checkbox'
						id='flexSwitchCheckDefault'
						checked
						onChange={(event) => {
							this.updateTodo(key, event.target.checked);
						}}
					/>
					<label
						className='form-check-label text-success'
						htmlFor='flexSwitchCheckDefault'>
						Done
					</label>
				</div>
			);
		} else {
			return (
				<div className='form-check form-switch'>
					<input
						className='form-check-input'
						type='checkbox'
						id='flexSwitchCheckDefault'
						onChange={(event) => {
							this.updateTodo(key, event.target.checked);
						}}
					/>
					<label
						className='form-check-label text-danger'
						htmlFor='flexSwitchCheckDefault'>
						Done
					</label>
				</div>
			);
		}
	}

	private renderTodoList() {
		console.log(this.state);
		return this.state.todoList.map((data) => {
			return (
				<div
					className='row border border-2 border-primary rounded m-3 p-3'
					key={data.key}>
					<div className='col-9'>{data.name}</div>
					<div className='col-2 '>
						{this.renderLabelDone(data.key, data.complete)}
					</div>
					<button
						className='col-1 btn btn-danger'
						onClick={() => {
							this.deleteTodo(data.key);
						}}>
						<Trash />
					</button>
				</div>
			);
		});
	}
}

export default TodoList;
