/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';

export type Person = { gender: 'M' | 'F', firstName: string, lastName: string, age: number };

type PersonTableProps = {
    persons: Person[],
};

export default class PersonTable extends Component<PersonTableProps> {
    renderPerson = (person: Person, index: number): React$Node => (
        <tr key={index}>
            <td>{person.gender}</td>
            <td>{person.firstName}</td>
            <td>{person.lastName}</td>
            <td>{person.age}</td>
        </tr>
    );

    render(): React$Node {
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
