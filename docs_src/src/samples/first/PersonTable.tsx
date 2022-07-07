import React, { Component } from 'react';

export type Gender = 'M' | 'F';
export type Person = { gender: Gender; firstName: string; lastName: string; age: number };

type PersonTableProps = { persons: Person[] };

export class PersonTable extends Component<PersonTableProps> {
    renderPerson = (person: Person, index: number): React.ReactNode => (
        <tr key={index}>
            <td>{person.gender}</td>
            <td>{person.firstName}</td>
            <td>{person.lastName}</td>
            <td>{person.age}</td>
        </tr>
    );

    render(): React.ReactNode {
        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Gender</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.persons.map((person: Person, index: number) => this.renderPerson(person, index))}
                </tbody>
            </table>
        );
    }
}
