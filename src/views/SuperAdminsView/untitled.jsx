import { useState, useEffect } from "react";
import { Button, Modal, Table, Form, Container, Spinner, ListGroup } from "react-bootstrap";
import styles from "./ManageCareHomesPage.module.css";
import useAxiosPrivate from "@hooks/useAxiosPrivate";

function ManageCareHomesPage() {
  const [careHomeElements, setCareHomeElements] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminNames, setAdminNames] = useState({});
  const [selectedCareHomeUrl, setSelectedCareHomeUrl] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedCareHome, setSelectedCareHome] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    getCareHomes();
  }, []);

  const getCareHomes = async () => {
    try {
      const careHomes = await fetchAllCareHomes();
      setCareHomeElements(careHomes);
      careHomes.forEach((careHome) => {
        if (careHome.admin) {
          fetchAdminName(careHome.admin);
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAllCareHomes = async (url = `/carehomes/`, accumulatedResults = []) => {
    try {
      const response = await axiosPrivate.get(url);
      const results = accumulatedResults.concat(response?.data?.results);
      if (response?.data?.next) {
        return fetchAllCareHomes(response?.data?.next, results);
      }
      return results.flat();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAdminName = async (url) => {
    try {
      const response = await axiosPrivate.get(url);
      setAdminNames((prevNames) => ({
        ...prevNames,
        [url]: response?.data?.name,
      }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAllAdmins = async (url = `/auth/users/`) => {
    setLoadingAdmins(true);
    setAdmins([]);
    try {
      const response = await axiosPrivate.get(url);
      const filteredAdmins = response?.data?.results.filter((admin) => admin.is_admin);
      setAdmins((prevAdmins) => [...prevAdmins, ...filteredAdmins]);
      if (response?.data?.next) {
        fetchAllAdmins(response?.data?.next);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleShowAssignModal = (careHomeUrl) => {
    setSelectedCareHomeUrl(careHomeUrl);
    fetchAllAdmins();
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
  };

  const handleShowEditModal = (careHome) => {
    setSelectedCareHome(careHome);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
  };

  const handleDelete = async (careHomeUrl) => {
    try {
      const response = await axiosPrivate.delete(careHomeUrl);
      setCareHomeElements((prevElements) =>
          prevElements.filter((elm) => elm.key !== careHomeUrl)
      );
      getCareHomes();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const updatedCareHome = {
      name: event.target.name.value,
      address: event.target.address.value,
    };

    try {
      const response = await axiosPrivate.put(
          selectedCareHome.url,
          JSON.stringify(updatedCareHome)
      );
      setCareHomeElements((prevElements) =>
          prevElements.map((elm) =>
              elm.key === selectedCareHome.url
                  ? {
                    ...elm,
                    props: {
                      ...elm.props,
                      children: (
                          <tbody>
                          <tr>
                            <td className={styles.fixedWidthColumn}>
                              {updatedCareHome.name}
                            </td>
                            <td className={styles.fixedWidthColumn}>
                              {updatedCareHome.code}
                            </td>
                            <td className={styles.fixedWidthColumn}>
                              {updatedCareHome.address}
                            </td>
                            <td>
                              {selectedCareHome.admin === null && (
                                  <Button
                                      className={styles.fixButton}
                                      onClick={() =>
                                          handleShowAssignModal(selectedCareHome.url)
                                      }
                                  >
                                    Assign Admin
                                  </Button>
                              )}
                              <Button
                                  className={styles.fixButton}
                                  onClick={() =>
                                      handleShowEditModal(selectedCareHome)
                                  }
                              >
                                Edit
                              </Button>
                              <Button
                                  className={styles.fixButton}
                                  onClick={() => handleDelete(selectedCareHome.url)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                          </tbody>
                      ),
                    },
                  }
                  : elm
          )
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const assignAdmin = async (careHomeUrl, admin) => {
    setAssigningAdmin(true);
    try {
      const careHome = await axiosPrivate.get(careHomeUrl);
      const response = await axiosPrivate.put(
          careHomeUrl,
          JSON.stringify({
            name: careHome?.data?.name,
            address: careHome?.data?.address,
            admin,
          })
      );
      getCareHomes();
      handleCloseAssignModal();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAssigningAdmin(false);
    }
  };

  return (
      <Container fluid className="mx-5">
        <Table responsive hover>
          <thead>
          <tr>
            <th className={styles.fixedWidthColumn}>Name</th>
            <th className={styles.fixedWidthColumn}>Code</th>
            <th className={styles.fixedWidthColumn}>Address</th>
            <th className={styles.fixedWidthColumn}>Admin</th>
            <th className={styles.fixedWidthColumn}>Action</th>
          </tr>
          </thead>
          <tbody>
          {careHomeElements.map((result, index) => (
              <tr key={result.url}>
                <td className={styles.fixedWidthColumn}>{result.name}</td>
                <td className={styles.fixedWidthColumn}>{result.code}</td>
                <td className={styles.fixedWidthColumn}>{result.address}</td>
                <td>
                  {result.admin ? (
                      <p>{adminNames[result.admin]}</p>
                  ) : (
                      <Button
                          className={styles.fixButton}
                          onClick={() => handleShowAssignModal(result.url)}
                      >
                        Assign Admin
                      </Button>
                  )}
                </td>
                <td className={styles.fixedWidthColumn}>
                  <Button
                      className={styles.fixButton}
                      variant="success"
                      onClick={() => handleShowEditModal(result)}
                  >
                    Edit
                  </Button>
                  <Button
                      className={styles.fixButton}
                      variant="danger"
                      onClick={() => handleDelete(result.url)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
          ))}
          </tbody>
        </Table>

        <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Select an Admin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingAdmins ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
            ) : admins.length ? (
                <ListGroup>
                  {admins.map((admin) => (
                      <ListGroup.Item
                          key={admin.id}
                          className="d-flex justify-content-between align-items-center"
                      >
                        <h3>{admin.name}</h3>
                        <Button
                            variant="primary"
                            onClick={() => handleSelectAdmin(admin)}
                        >
                          Select
                        </Button>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
            ) : (
                <p>No admins available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAssignModal}>
              Close
            </Button>
            {selectedAdmin && (
                <Button
                    variant="primary"
                    onClick={() => assignAdmin(selectedCareHomeUrl, selectedAdmin.url)}
                    disabled={assigningAdmin}
                >
                  {assigningAdmin ? (
                      <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="mx-2"
                        /> Assigning...
                      </>
                  ) : (
                      "Assign"
                  )}
                </Button>
            )}
          </Modal.Footer>
        </Modal>

        <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Care Home</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCareHome ? (
                <Form onSubmit={handleEditSubmit}>
                  <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        defaultValue={selectedCareHome.name}
                        required
                    />
                  </Form.Group>
                  <Form.Group controlId="code">
                    <Form.Label>Code</Form.Label>
                    <Form.Control
                        type="text"
                        defaultValue={selectedCareHome.code}
                        disabled
                        readOnly
                    />
                  </Form.Group>
                  <Form.Group controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        defaultValue={selectedCareHome.address}
                        required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Save changes
                  </Button>
                </Form>
            ) : (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
}

export default ManageCareHomesPage;


// import { useState, useEffect } from "react";
// import {Button, Modal, Table, Form, Container} from "react-bootstrap";
// import styles from "./ManageCareHomesPage.module.css";
// import useAxiosPrivate from "@hooks/useAxiosPrivate";
//
// function ManageCareHomesPage() {
//   const [careHomeElements, setCareHomeElements] = useState([]);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [admins, setAdmins] = useState([]);
//   const [adminNames, setAdminNames] = useState({});
//   const [selectedCareHomeUrl, setSelectedCareHomeUrl] = useState(null);
//   const [selectedAdmin, setSelectedAdmin] = useState(null);
//   const [selectedCareHome, setSelectedCareHome] = useState(null);
//   const axiosPrivate = useAxiosPrivate();
//
//   useEffect(() => {
//     getCareHomes();
//   }, []);
//
//   const getCareHomes = async () => {
//     try {
//       const careHomes = await fetchAllCareHomes();
//       setCareHomeElements(careHomes);
//       careHomes.forEach((careHome) => {
//         if (careHome.admin) {
//           fetchAdminName(careHome.admin);
//         }
//       });
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//   const fetchAllCareHomes = async (
//     url = `/carehomes/`,
//     accumulatedResults = []
//   ) => {
//     try {
//       const response = await axiosPrivate.get(url);
//       const results = accumulatedResults.concat(response?.data?.results);
//       if (response?.data?.next) {
//         return fetchAllCareHomes(response?.data?.next, results);
//       }
//       return results.flat();
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//   const fetchAdminName = async (url) => {
//     try {
//       const response = await axiosPrivate.get(url);
//       setAdminNames((prevNames) => ({
//         ...prevNames,
//         [url]: response?.data?.name,
//       }));
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//
//
//   const fetchAllAdmins = async (url = `/auth/users/`) => {
//     setAdmins([]);
//     try {
//       const response = await axiosPrivate.get(url);
//       const filteredAdmins = response?.data?.results.filter(
//         (admin) => admin.is_admin
//       );
//       setAdmins((prevAdmins) => [...prevAdmins, ...filteredAdmins]);
//       if (response?.data?.next) {
//         fetchAllAdmins(response?.data?.next);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//   const handleShowAssignModal = (careHomeUrl) => {
//     setSelectedCareHomeUrl(careHomeUrl);
//     fetchAllAdmins();
//     setShowAssignModal(true);
//   };
//
//   const handleCloseAssignModal = () => {
//     setShowAssignModal(false);
//   };
//
//   const handleShowEditModal = (careHome) => {
//     setSelectedCareHome(careHome);
//     setShowEditModal(true);
//   };
//
//   const handleCloseEditModal = () => {
//     setShowEditModal(false);
//   };
//
//   const handleSelectAdmin = (admin) => {
//     setSelectedAdmin(admin);
//   };
//
//   const handleDelete = async (careHomeUrl) => {
//     try {
//       const response = await axiosPrivate.delete(careHomeUrl);
//       setCareHomeElements((prevElements) =>
//         prevElements.filter((elm) => elm.key !== careHomeUrl)
//       );
//       getCareHomes();
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//   const handleEditSubmit = async (event) => {
//     event.preventDefault();
//     const updatedCareHome = {
//       name: event.target.name.value,
//       address: event.target.address.value,
//     };
//
//     try {
//       const response = await axiosPrivate.put(
//         selectedCareHome.url,
//         JSON.stringify(updatedCareHome)
//       );
//       setCareHomeElements((prevElements) =>
//         prevElements.map((elm) =>
//           elm.key === selectedCareHome.url
//             ? {
//                 ...elm,
//                 props: {
//                   ...elm.props,
//                   children: (
//                     <tbody>
//                       <tr>
//                         <td className={styles.fixedWidthColumn}>
//                           {updatedCareHome.name}
//                         </td>
//                         <td className={styles.fixedWidthColumn}>
//                           {updatedCareHome.code}
//                         </td>
//                         <td className={styles.fixedWidthColumn}>
//                           {updatedCareHome.address}
//                         </td>
//                         <td>
//                           {selectedCareHome.admin === null && (
//                             <Button
//                               className={styles.fixButton}
//                               onClick={() =>
//                                 handleShowAssignModal(selectedCareHome.url)
//                               }
//                             >
//                               Assign Admin
//                             </Button>
//                           )}
//                           <Button
//                             className={styles.fixButton}
//                             onClick={() =>
//                               handleShowEditModal(selectedCareHome)
//                             }
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             className={styles.fixButton}
//                             onClick={() => handleDelete(selectedCareHome.url)}
//                           >
//                             Delete
//                           </Button>
//                         </td>
//                       </tr>
//                     </tbody>
//                   ),
//                 },
//               }
//             : elm
//         )
//       );
//       handleCloseEditModal();
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//   const assignAdmin = async (careHomeUrl, admin) => {
//     try {
//       const careHome = await axiosPrivate.get(careHomeUrl);
//       console.error(careHome);
//       const response = await axiosPrivate.put(
//         careHomeUrl,
//         JSON.stringify({
//           name: careHome?.data?.name,
//           address: careHome?.data?.address,
//           admin,
//         })
//       );
//       getCareHomes();
//       handleCloseAssignModal();
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//
//
//   return (
//     <Container fluid className="mx-5">
//       <Table responsive hover>
//         <thead>
//           <tr>
//             <th className={styles.fixedWidthColumn}>Name</th>
//             <th className={styles.fixedWidthColumn}>Code</th>
//             <th className={styles.fixedWidthColumn}>Address</th>
//             <th className={styles.fixedWidthColumn}>Admin</th>
//             <th className={styles.fixedWidthColumn}>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {careHomeElements.map((result, index) => (
//             <tr key={result.url}>
//               <td className={styles.fixedWidthColumn}>{result.name}</td>
//               <td className={styles.fixedWidthColumn}>{result.code}</td>
//               <td className={styles.fixedWidthColumn}>{result.address}</td>
//               <td>
//                 {result.admin ? (
//                   <p>{adminNames[result.admin]}</p>
//                 ) : (
//                   <Button
//                     className={styles.fixButton}
//                     onClick={() => handleShowAssignModal(result.url)}
//                   >
//                     Assign Admin
//                   </Button>
//                 )}
//               </td>
//               <td className={styles.fixedWidthColumn}>
//                 <Button
//                   className={styles.fixButton}
//                   variant="success"
//                   onClick={() => handleShowEditModal(result)}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   className={styles.fixButton}
//                   variant="danger"
//                   onClick={() => handleDelete(result.url)}
//                 >
//                   Delete
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//
//       <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Select an Admin</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {admins.length > 0 ? (
//             <ul>
//               {admins.map((admin) => (
//                 <li key={admin.id}>
//                   <h3 className={styles.adminName}>{admin.name}</h3>
//                   <Button
//                     className={styles.fixButton}
//                     onClick={() => handleSelectAdmin(admin)}
//                   >
//                     Select
//                   </Button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No admins available</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseAssignModal}>
//             Close
//           </Button>
//           {selectedAdmin && (
//             <Button
//               className={styles.fixButton}
//               onClick={() =>
//                 assignAdmin(selectedCareHomeUrl, selectedAdmin.url)
//               }
//             >
//               Assign
//             </Button>
//           )}
//         </Modal.Footer>
//       </Modal>
//
//       <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Care Home</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedCareHome && (
//             <Form onSubmit={handleEditSubmit}>
//               <Form.Group controlId="name">
//                 <Form.Label>Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   defaultValue={selectedCareHome.name}
//                   required
//                 />
//               </Form.Group>
//               <Form.Group controlId="code">
//                 <Form.Label>Code</Form.Label>
//                 <Form.Control
//                   type="text"
//                   defaultValue={selectedCareHome.code}
//                   disabled
//                   readOnly
//                 />
//               </Form.Group>
//               <Form.Group controlId="address">
//                 <Form.Label>Address</Form.Label>
//                 <Form.Control
//                   type="text"
//                   defaultValue={selectedCareHome.address}
//                   required
//                 />
//               </Form.Group>
//               <Button variant="primary" type="submit">
//                 Save changes
//               </Button>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseEditModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }
//
// export default ManageCareHomesPage;