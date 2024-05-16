import React from "react";

export type Gender = "M" | "F";
export type Person = {
  gender: Gender;
  firstName: string;
  lastName: string;
  age: number;
};

type PersonTableProps = { persons: Person[] };

export const PersonTable: React.FC<PersonTableProps> = ({ persons }) => (
  <table>
    <thead>
      <tr>
        <th>Gender</th>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
      </tr>
    </thead>
    <tbody>
      {persons.map((person: Person, index: number) => (
        <tr key={index}>
          <td>{person.gender}</td>
          <td>{person.firstName}</td>
          <td>{person.lastName}</td>
          <td>{person.age}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
